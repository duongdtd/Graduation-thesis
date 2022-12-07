/***************************************************************************//**
 * @file
 * @brief Core application logic.
 *******************************************************************************
 * # License
 * <b>Copyright 2020 Silicon Laboratories Inc. www.silabs.com</b>
 *******************************************************************************
 *
 * SPDX-License-Identifier: Zlib
 *
 * The licensor of this software is Silicon Laboratories Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 *
 ******************************************************************************/
#include "i2c_lib.h"
#include "gpio_exti.h"
#include "lcd.h"
#include "em_emu.h"
#include "em_iadc.h"
#include "em_common.h"
#include "app_assert.h"
#include "sl_bluetooth.h"
#include "gatt_db.h"
#include "app.h"
#include "sl_sleeptimer.h"
#include "em_rtcc.h"
#include "em_i2c.h"
#include "em_gpio.h"
#include "sl_app_log.h"
#include "em_chip.h"
#include "em_device.h"
#include "em_msc.h"
#include "function.h"
#include "stdint.h"
#include "sl_iostream_init_usart_instances.h"
#include "sl_iostream_usart.h"
#include"mem_msc.h"
#include"AS608.h"
#include "usart0_lib.h"
#include "ecode.h"
#include "em_usart.h"
#include "sl_pwm_instances.h"
#include "sl_pwm.h"
#include "adc_1.h"
static uint8_t advertising_set_handle = 0xff;

//soft timer
#define TIMER_MS(ms) ((32768 * ms) / 1000)
#define TIMER_S(s) (s * 32768)
#define KEY_SCAN 0
#define FINGER_SCAN 1
#define SLEEP_LCD 2
#define PIN 3

uint8_t count = 0;
uint8_t device_id[9] =
  { 1, 2, 3, 4, 5, 6, 7, 8, 9 };
uint8_t door_status = 0;
uint8_t mode_lcd = 0;
uint8_t check_device = 0;
uint8_t key_press[8]; // buffer password - keypad
uint8_t count_press = 0; // length of buffer
uint8_t re[20]; //buffer reply
uint8_t idx = 0;  // length of reply
uint8_t flag = 0; // flag interrupt of USART0
int8_t check_rep = -1; // check ACK of AS608
uint8_t received = 0; //check reply USART0
uint8_t lcd_status = 1;
//check finger
uint16_t finger_id;
uint16_t match;
uint8_t flag_finger = 0;
//uint8_t check_timer = 1;
uint8_t set_id = 0;
uint8_t enable_polling = 1;

uint8_t counter_enter = 0;
//ble
uint8_t notifyEnabled = false;
uint8_t app_connection;

//encode & decode
uint8_t pub_key = 10; //public key
uint8_t pri_key; //private key
/**************************************************************************//**
 * Application Init.
 *****************************************************************************/
finger AS608;

static volatile IADC_Result_t sample;
#define EM2DEBUG                  1

// Result converted to volts
static volatile float singleResult;
void
IADC_IRQHandler (void)
{
  sample = IADC_pullSingleFifoResult (IADC0);
  singleResult = sample.data;
  app_log("ADC: %d\n", sample.data);

  IADC_clearInt (IADC0, IADC_IF_SINGLEDONE);
}
void
USART0_RX_IRQHandler (void)
{
  if (USART0->STATUS & USART_STATUS_RXDATAV)
    {
      flag = 0;
      uint8_t rxData = USART_Rx (USART0);
      re[idx] = rxData;
      idx++;
    }
  if (USART0->IF & USART_IF_TCMP1)
    {
      flag = 1;
      USART_IntClear (USART0, USART_IF_RXDATAV);
      USART_IntClear (USART0, USART_IF_TCMP1);
    }

}
SL_WEAK void
app_init (void)
{
  /////////////////////////////////////////////////////////////////////////////
  // Put your additional application init code here!                         //
  // This is called once during start-up.                                    //
  /////////////////////////////////////////////////////////////////////////////
  app_log("Init\n");
  CHIP_Init ();
  i2c_init ();
  lcd_init ();
  lcd_send_string ("Welcome Home");
  sl_pwm_init_instances ();
  lcd_goto_XY (2, 0);
  GPIO_EXTI_Init ();
  sl_bt_system_set_soft_timer (TIMER_MS(100), KEY_SCAN, 0);
  sl_bt_system_set_soft_timer (TIMER_S(30), SLEEP_LCD, 0);
  sl_bt_system_set_soft_timer (TIMER_S(600), PIN, 0);

  initIADC ();
#ifdef EM2DEBUG
#if (EM2DEBUG == 1)
  // Enable debug connectivity in EM2
  EMU->CTRL_SET = EMU_CTRL_EM2DBGEN;
#endif
#endif
  usart_init_ ();
  AS608.state = STATE_1;
  app_log("Start\n");

  mem_init ();
}

/**************************************************************************//**
 * Application Process Action.
 *****************************************************************************/
SL_WEAK void
app_process_action (void)
{
  /////////////////////////////////////////////////////////////////////////////
  // Put your additional application code here!                              //
  // This is called infinitely.                                              //
  // Do not call blocking functions from here!                               //
  /////////////////////////////////////////////////////////////////////////////
  if (flag == 1)
    {
      check_rep = -1;
      uint8_t packettype;
      uint16_t len;
      uint8_t packet[20];
      if (idx >= 9)
        {
          packettype = re[6];
          len <<= 8;
          len |= re[8];
          len -= 2;
          packet[0] = packettype;
          for (int i = 0; i < len; i++)
            {
              packet[1 + i] = re[9 + i];
            }
          if ((len != 1) && (packet[0] != FINGERPRINT_ACKPACKET))
            {
              check_rep = -1;
              // app_log("%d",check_rep);
            }
          else
            {
              check_rep = packet[1];
              // app_log("%d",check_rep);pp_log("1\n");
              finger_id = 0xFFFF;
              match = 0xFFFF;

              finger_id = packet[2];
              finger_id <<= 8;
              finger_id |= packet[3];
              match = packet[4];
              match <<= 8;
              match |= packet[5];
            }
          flag = 0;
          idx = 0;
          received = 1;
        }
      else
        {
          received = 0;
          check_rep = -1;
        }
    }
  if (received == 1)
    {
      switch (AS608.state)
        {
        case STATE_1:  //SCAN IMAGE FINGER
          if (check_rep == FINGERPRINT_OK)
            {
              if (AS608.check_status == 2)
                {
                  app_log("success\n");
                  send_status_ble_id (&notifyEnabled, &app_connection, 2,
                                      set_id);
                  set_id = 0;
                  AS608.state = STATE_1;
                  AS608.check_status = 0;
                }
              else
                {
                  app_log("Image taken\n");
                  image2Tz (1);
                  AS608.state = STATE_2;
                }
            }
          else
            {
              if (AS608.check_status == 2)
                {
                  app_log("failed\n");
                  AS608.state = STATE_1;
                  send_status_ble (&notifyEnabled, &app_connection, 1, 0,
                                   pub_key, &pri_key);
                  set_id = 0;
                  AS608.check_status = 0;
                }
              else if (AS608.check_status == 1 && enable_polling == 1)
                {
                  AS608.state = STATE_1;
                  app_log("err1\n");
                }
              else
                {
                  AS608.state = STATE_1;
                  app_log("err\n");
                  getImage ();
                }
            }
          received = 0;
          break;
        case STATE_2: // generate character file from the original finger image
          if (check_rep == FINGERPRINT_OK)
            {
              app_log("Image converted\n");
              if (AS608.check_status == 1 && enable_polling == 1)
                {
                  AS608.state = STATE_8;
                  searchFinger ();
                  flag_finger = 1;
                }
              else
                {
                  AS608.state = STATE_3;
                  getImage ();
                  app_log("Remove finger\n");
                  lcd_clear ();
                  sl_sleeptimer_delay_millisecond (5);
                  lcd_send_string ("Remove finger");
                  sl_sleeptimer_delay_millisecond (2000);
                }
            }
          else
            {
              app_log("Unknown error\n");
              AS608.state = STATE_1;
              //              check_timer = 1;
              enable_polling = 1;
            }

          received = 0;
          break;
        case STATE_3: // Check if the finger has moved ? if(true) => re-place the finger
          switch (check_rep)
            {
            case FINGERPRINT_NOFINGER:
              getImage ();
              AS608.state = STATE_4;
              app_log("\nID : %d\n", set_id);
              app_log("Place same finger again\n");
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Place again");
              break;
            default:
              app_log(".");
              AS608.state = STATE_3;
              getImage ();
              break;
            }
          received = 0;
          break;
        case STATE_4: // re-place the finger =>  generate character file from the original finger image
          switch (check_rep)
            {
            case FINGERPRINT_OK:
              app_log("Image taken\n");
              image2Tz (2);
              AS608.state = STATE_5;
              break;
            default:
              app_log(".\n");
              AS608.state = STATE_4;

              getImage ();
              break;
            }
          received = 0;
          break;
        case STATE_5: // generate character file from the original finger image => if(true) create model
          sl_sleeptimer_delay_millisecond (1000);
          switch (check_rep)
            {
            case FINGERPRINT_OK:
              app_log("Image converted\n");
              createModel ();
              AS608.state = STATE_6;
              break;
            default:
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Error");
              app_log("Unknown error\n");
              send_status_ble_id (&notifyEnabled, &app_connection, 90, 12);
              AS608.state = STATE_1;
              enable_polling = 1;
            }
          received = 0;
          break;
        case STATE_6: // create model => if(true) store model with id
          switch (check_rep)
            {
            case FINGERPRINT_OK:
              app_log("Prints matched!\n");
              if (set_id == 0)
                {
                  app_log("Create error\n");
                  lcd_clear ();
                  sl_sleeptimer_delay_millisecond (5);
                  lcd_send_string ("Error");
                  AS608.state = STATE_1;
                  enable_polling = 1;
                  send_status_ble_id (&notifyEnabled, &app_connection, 90, 12);
                }
              else
                {
                  AS608.state = STATE_7;
                  storeModel (set_id);
                }
              break;
            default:
              app_log("Unknown error\n");
              AS608.state = STATE_1;
              send_status_ble_id (&notifyEnabled, &app_connection, 1, set_id);
              enable_polling = 1;
            }
          received = 0;
          break;
        case STATE_7: // stored
          switch (check_rep)
            {
            case FINGERPRINT_OK:
              app_log("Stored\n");
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Success");
              send_status_ble_id (&notifyEnabled, &app_connection, 1, set_id);
              set_id = 0;
              break;
            default:
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Error");
              app_log("Unknown error\n");
              send_status_ble_id (&notifyEnabled, &app_connection, 90, 12);
              received = 0;
            }
          AS608.state = STATE_1;
          received = 0;
          enable_polling = 1;
          //          check_timer = 1;
          break;
        case STATE_8:
          switch (check_rep)
            {
            case FINGERPRINT_OK:
              app_log("Check success : ID %d match %d\n", finger_id, match);
              send_ble_client (&app_connection, 98, finger_id);
              run_motor ();
              door_status = 1;
              AS608.state = STATE_1;
              break;
            default:
              app_log("Can't check finger \n");
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Error");
              sl_sleeptimer_delay_millisecond (3000);
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Welcome Home");
              AS608.state = STATE_1;
            }
          received = 0;
          break;
        }

    }

}

void
process_server_user_write_request (sl_bt_msg_t *evt)
{
  sl_bt_system_set_soft_timer (0, SLEEP_LCD, 0);
  if (lcd_status == 0)
    {
      lcd_on_display ();
      lcd_status = 1;
    }
  sl_status_t sc;
  uint32_t connection = evt->data.evt_gatt_server_user_write_request.connection;
  uint32_t characteristic =
      evt->data.evt_gatt_server_user_write_request.characteristic;
  sc = sl_bt_gatt_server_send_user_write_response (connection, characteristic,
                                                   0);
  if (characteristic == gattdb_App_ch)
    {
      app_log("gattdb_App_ch header: %d --- len : %d\n",
              evt->data.evt_gatt_server_attribute_value.value.data[0],

              evt->data.evt_gatt_server_attribute_value.value.len);
      if (evt->data.evt_gatt_server_attribute_value.value.data[0] == 10)
        {
          run_motor ();
          door_status = 1;
        }
    }
  else if (characteristic == gattdb_device_ch)
    {
      app_log("header: %d --- len : %d\n",
              evt->data.evt_gatt_server_attribute_value.value.data[0],
              evt->data.evt_gatt_server_attribute_value.value.len);
      if (evt->data.evt_gatt_server_attribute_value.value.data[0] == 1
          && evt->data.evt_gatt_server_attribute_value.value.len == 3)
        {
          //delete finger
          if (evt->data.evt_gatt_server_attribute_value.value.data[1] == 2)
            {
              AS608.check_status = 2;
              set_id = evt->data.evt_gatt_server_attribute_value.value.data[2];
              deleteFinger (set_id);
            }
          //add finger
          else if (evt->data.evt_gatt_server_attribute_value.value.data[1] == 1)
            {
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Place finger");
              enable_polling = 0;
              set_id = evt->data.evt_gatt_server_attribute_value.value.data[2];
              getImage ();
              AS608.check_status = 0;
            }
          //change local password
          else if (evt->data.evt_gatt_server_attribute_value.value.data[1] == 3)
            {
              mode_lcd = 1;
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("New Password");
              lcd_goto_XY (2, 0);
            }
        }
      else if (evt->data.evt_gatt_server_attribute_value.value.data[0] == 2
          && evt->data.evt_gatt_server_attribute_value.value.len == 11)
        {
          int i;
          pri_key = evt->data.evt_gatt_server_attribute_value.value.data[1];
          app_log("decode private key: %d\n", pri_key);
          for (i = 2; i <= 10; i++)
            {
              if (decode (
                  evt->data.evt_gatt_server_attribute_value.value.data[i],
                  pub_key, pri_key) == device_id[i - 2])
                {
                  check_device++;
                }
            }
          app_log("\n");
        }
      else if (evt->data.evt_gatt_server_attribute_value.value.data[0] == 99
          && evt->data.evt_gatt_server_attribute_value.value.len == 1)
        {
          check_device = 9;
        }
      else if (evt->data.evt_gatt_server_attribute_value.value.data[0] == 98)
        {
          uint8_t abc[evt->data.evt_gatt_server_attribute_value.value.len - 1];
          for (int i = 1;
              i < evt->data.evt_gatt_server_attribute_value.value.len; i++)
            {
              abc[i - 1] =
                  evt->data.evt_gatt_server_attribute_value.value.data[i];
            }
          uint32_t pass_tmp = mem_read (1);
          uint32_t pass_tmp1 = dec_to_hex (
              abc, evt->data.evt_gatt_server_attribute_value.value.len - 1);
          if (pass_tmp == pass_tmp1)
            {
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Success");
              run_motor ();
              door_status = 1;
            }
          else
            {
              lcd_clear ();
              sl_sleeptimer_delay_millisecond (5);
              lcd_send_string ("Wrong Password");
            }
        }

    }
  sl_bt_system_set_soft_timer (TIMER_S(30), SLEEP_LCD, 0);
}
/**************************************************************************//**
 * Bluetooth stack event handler.
 * This overrides the dummy weak implementation.
 *
 * @param[in] evt Event coming from the Bluetooth stack.
 *****************************************************************************/
void
sl_bt_on_event (sl_bt_msg_t *evt)
{
  sl_status_t sc;
  bd_addr address;
  uint8_t address_type;
  uint8_t system_id[8];

  switch (SL_BT_MSG_ID(evt->header))
    {
    // -------------------------------
    // This event indicates the device has started and the radio is ready.
    // Do not call any stack command before receiving this boot event!
    case sl_bt_evt_system_boot_id:

      // Extract unique ID from BT Address.
      sc = sl_bt_system_get_identity_address (&address, &address_type);
      app_assert_status(sc);

      // Pad and reverse unique ID to get System ID.
      system_id[0] = address.addr[5];
      system_id[1] = address.addr[4];
      system_id[2] = address.addr[3];
      system_id[3] = 0xFF;
      system_id[4] = 0xFE;
      system_id[5] = address.addr[2];
      system_id[6] = address.addr[1];
      system_id[7] = address.addr[0];

      sc = sl_bt_gatt_server_write_attribute_value (gattdb_system_id, 0,
                                                    sizeof(system_id),
                                                    system_id);
      app_assert_status(sc);

      // Create an advertising set.
      sc = sl_bt_advertiser_create_set (&advertising_set_handle);
      app_assert_status(sc);

      // Set advertising interval to 100ms.
      sc = sl_bt_advertiser_set_timing (advertising_set_handle, 160 * 5, // min. adv. interval (milliseconds * 1.6)
                                        160 * 5, // max. adv. interval (milliseconds * 1.6)
                                        0,   // adv. duration
                                        0);  // max. num. adv. events
      app_assert_status(sc);
      // Start general advertising and enable connections.
      sc = sl_bt_advertiser_start (advertising_set_handle,
                                   sl_bt_advertiser_general_discoverable,
                                   sl_bt_advertiser_connectable_scannable);
      app_assert_status(sc);
      break;

      // -------------------------------
      // This event indicates that a new connection was opened.
    case sl_bt_evt_connection_opened_id:
      app_log("sl_bt_evt_connection_opened_id\n");
      app_connection = evt->data.evt_connection_opened.connection;

      // Restart advertising after client has disconnected.
      sc = sl_bt_advertiser_start (advertising_set_handle,
                                   sl_bt_advertiser_general_discoverable,
                                   sl_bt_advertiser_connectable_scannable);
      app_assert_status(sc);
      break;

      // -------------------------------
      // This event indicates that a connection was closed.
    case sl_bt_evt_connection_closed_id:
      // Restart advertising after client has disconnected.
      sc = sl_bt_advertiser_start (advertising_set_handle,
                                   sl_bt_advertiser_general_discoverable,
                                   sl_bt_advertiser_connectable_scannable);
      app_assert_status(sc);
      app_log("disconnect\n");
      notifyEnabled = false;
      break;

      ///////////////////////////////////////////////////////////////////////////
      // Add additional event handlers here as your application requires!      //
      ///////////////////////////////////////////////////////////////////////////
      ///
    case sl_bt_evt_gatt_server_characteristic_status_id:
      if (gatt_server_client_config
          == (gatt_server_characteristic_status_flag_t) evt->data.evt_gatt_server_characteristic_status.status_flags)
        {
          if (evt->data.evt_gatt_server_characteristic_status.client_config_flags
              == 1)
            {
              notifyEnabled = true;
              if (check_device == 9)
                {
                  send_status_ble_monitor (&notifyEnabled, &app_connection, 1,
                                           pub_key, &pri_key);
                }
              else
                {
                  send_status_ble_monitor (&notifyEnabled, &app_connection, 0,
                                           pub_key, &pri_key);
                }
              check_device = 0;
              app_log("%d\n", check_device);
              app_log("Enable notify characteristic\n");
            }
          else
            {
              notifyEnabled = false;
              app_log("Disable characteristic\n");
            }
        }
      break;
    case sl_bt_evt_gatt_server_user_write_request_id:
      process_server_user_write_request (evt);

      break;
    case sl_bt_evt_system_soft_timer_id:
      if (evt->data.evt_system_soft_timer.handle == KEY_SCAN)
        {
          if (count == 0)
            {
              GPIO_PinOutClear (Col1_Port, Col1_pin);
              GPIO_PinOutSet (Col3_Port, Col3_pin);
              count++;

            }
          else if (count == 1)
            {
              GPIO_PinOutClear (Col2_Port, Col2_pin);
              GPIO_PinOutSet (Col1_Port, Col1_pin);
              count++;

            }
          else if (count == 2)
            {
              GPIO_PinOutClear (Col3_Port, Col3_pin);
              GPIO_PinOutSet (Col2_Port, Col2_pin);
              count = 0;

            }
        }
      if (evt->data.evt_system_soft_timer.handle == SLEEP_LCD)
        {
          if (lcd_status == 1)
            {
              lcd_off_display ();
              lcd_status = 0;
            }
          if (door_status == 1)
            {
              run_motor ();
              door_status = 0;
              mode_lcd = 0;
              count_press = 0;
            }
        }
      if (evt->data.evt_system_soft_timer.handle == PIN)
        {
          uint8_t power = 99;
          send_status_ble_monitor (&notifyEnabled, &app_connection, power,
                                   pub_key, &pri_key);
        }
      break;
    case sl_bt_evt_system_external_signal_id:
      sl_bt_system_set_soft_timer (0, SLEEP_LCD, 0);
      if (lcd_status == 0)
        {
          lcd_on_display ();
          lcd_status = 1;
        }
      if (evt->data.evt_system_external_signal.extsignals == Row1_pin)
        {
          if (GPIO_PinInGet (Row1_Port, Row1_pin) == 0
              && GPIO_PinOutGet (Col1_Port, Col1_pin) == 0)
            {
              key_press[count_press] = 1;
              count_press++;
              lcd_send_string ("1");
            }
          else if (GPIO_PinInGet (Row1_Port, Row1_pin) == 0
              && GPIO_PinOutGet (Col2_Port, Col2_pin) == 0)
            {
              key_press[count_press] = 2;
              count_press++;
              lcd_send_string ("2");
            }
          else if (GPIO_PinInGet (Row1_Port, Row1_pin) == 0
              && GPIO_PinOutGet (Col3_Port, Col3_pin) == 0)
            {
              key_press[count_press] = 3;
              count_press++;
              lcd_send_string ("3");
            }
        }
      else if (evt->data.evt_system_external_signal.extsignals == Row2_pin)
        {
          if (GPIO_PinInGet (Row2_Port, Row2_pin) == 0
              && GPIO_PinOutGet (Col1_Port, Col1_pin) == 0)
            {
              key_press[count_press] = 4;
              count_press++;
              lcd_send_string ("4");
            }
          else if (GPIO_PinInGet (Row2_Port, Row2_pin) == 0
              && GPIO_PinOutGet (Col2_Port, Col2_pin) == 0)
            {
              key_press[count_press] = 5;
              count_press++;
              lcd_send_string ("5");
            }
          else if (GPIO_PinInGet (Row2_Port, Row2_pin) == 0
              && GPIO_PinOutGet (Col3_Port, Col3_pin) == 0)
            {
              key_press[count_press] = 6;
              count_press++;
              lcd_send_string ("6");
            }
        }
      else if (evt->data.evt_system_external_signal.extsignals == Row3_pin)
        {
          if (GPIO_PinInGet (Row3_Port, Row3_pin) == 0
              && GPIO_PinOutGet (Col1_Port, Col1_pin) == 0)
            {
              key_press[count_press] = 7;
              count_press++;
              lcd_send_string ("7");
            }
          else if (GPIO_PinInGet (Row3_Port, Row3_pin) == 0
              && GPIO_PinOutGet (Col2_Port, Col2_pin) == 0)
            {
              key_press[count_press] = 8;
              count_press++;
              lcd_send_string ("8");
            }
          else if (GPIO_PinInGet (Row3_Port, Row3_pin) == 0
              && GPIO_PinOutGet (Col3_Port, Col3_pin) == 0)
            {
              key_press[count_press] = 9;
              count_press++;
              lcd_send_string ("9");
            }

        }
      else if (evt->data.evt_system_external_signal.extsignals == Row4_pin)
        {
          if (GPIO_PinInGet (Row4_Port, Row4_pin) == 0
              && GPIO_PinOutGet (Col1_Port, Col1_pin) == 0)
            {
              if (mode_lcd == 0)
                {
                  count_press = 0;
                  lcd_clear ();
                  sl_sleeptimer_delay_millisecond (5);
                  lcd_send_string ("Welcome Home");
                  lcd_goto_XY (2, 0);
                }
              else if (mode_lcd == 1)
                {
                  count_press = 0;
                  lcd_clear ();
                  sl_sleeptimer_delay_millisecond (5);
                  lcd_send_string ("New Password");
                  lcd_goto_XY (2, 0);
                }
            }
          else if (GPIO_PinInGet (Row4_Port, Row4_pin) == 0
              && GPIO_PinOutGet (Col2_Port, Col2_pin) == 0)
            {
              key_press[count_press] = 0;
              count_press++;
              lcd_send_string ("0");
            }
          else if (GPIO_PinInGet (Row4_Port, Row4_pin) == 0
              && GPIO_PinOutGet (Col3_Port, Col3_pin) == 0)
            {
              if (mode_lcd == 0)
                {
                  if (count > 8)
                    {
                      lcd_clear ();
                      sl_sleeptimer_delay_millisecond (5);
                      lcd_send_string ("Wrong Password");
                      counter_enter++;
                      if (counter_enter == 5)
                        {
                          send_ble_client (&app_connection, 82, 82);
                          counter_enter = 0;
                        }
                    }
                  else
                    {
                      uint32_t pass_tmp = mem_read (1);
                      uint32_t pass_tmp1 = dec_to_hex (key_press, count_press);
                      app_log("\ncheck %x----%x\n", pass_tmp, pass_tmp1);
                      if (pass_tmp == pass_tmp1)
                        {
                          lcd_clear ();
                          sl_sleeptimer_delay_millisecond (5);
                          lcd_send_string ("Success");
                          run_motor ();
                          door_status = 1;
                          send_ble_client (&app_connection, 99, 9);
                        }
                      else
                        {
                          lcd_clear ();
                          sl_sleeptimer_delay_millisecond (5);
                          lcd_send_string ("Wrong Password");
                          counter_enter++;
                          if (counter_enter == 5)
                            {
                              send_ble_client (&app_connection, 82, 82);
                              counter_enter = 0;
                            }
                        }
                    }
                }
              else if (mode_lcd == 1)
                {
                  if (count_press > 8)
                    {
                      lcd_clear ();
                      sl_sleeptimer_delay_millisecond (5);
                      lcd_send_string ("Too long");
                      count_press = 0;

                    }
                  else
                    {
                      mem_clear (1);
                      mem_write (key_press, count_press, 1);
                      send_status_ble_id (&notifyEnabled, &app_connection, 3,
                                          0);
                      lcd_clear ();
                      sl_sleeptimer_delay_millisecond (5);
                      lcd_send_string ("Success");
                      mode_lcd = 0;
                      count_press = 0;
                    }
                }
            }
        }
      else if (evt->data.evt_system_external_signal.extsignals == AS608_pin)
        {
          if (enable_polling == 1)
            {
              getImage ();
              AS608.check_status = 1;
              AS608.state = STATE_1;
            }
        }
      sl_bt_system_set_soft_timer (TIMER_S(30), SLEEP_LCD, 0);
      break;

      // -------------------------------
      // Default event handler.
    default:
      break;
    }
}
