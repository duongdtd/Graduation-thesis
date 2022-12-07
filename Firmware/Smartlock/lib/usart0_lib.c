/*
 * usart.c
 *
 *  Created on: Jul 2, 2022
 *      Author: ADMIN
 */
#include <lib/usart0_lib.h>
#include "stdint.h"
#include "em_cmu.h"
#include "em_usart.h"
#include "em_chip.h"

void usart_init_()
{

  CMU_ClockEnable(cmuClock_USART0, true);
  CMU_ClockEnable(cmuClock_GPIO, true);


  GPIO_PinModeSet(TX_Port, TX_Pin, gpioModePushPull, 1);

  // Configure the USART RX pin to the board controller as an input
  GPIO_PinModeSet(RX_Port, RX_Pin, gpioModeInputPull, 1);

  GPIO->USARTROUTE[0].TXROUTE = (TX_Port << _GPIO_USART_TXROUTE_PORT_SHIFT)
      | (TX_Port << _GPIO_USART_TXROUTE_PIN_SHIFT);
  GPIO->USARTROUTE[0].RXROUTE = (RX_Port << _GPIO_USART_RXROUTE_PORT_SHIFT)
      | (RX_Pin << _GPIO_USART_RXROUTE_PIN_SHIFT);

  GPIO->USARTROUTE[0].ROUTEEN = GPIO_USART_ROUTEEN_RXPEN | GPIO_USART_ROUTEEN_TXPEN;

  USART_InitAsync_TypeDef initAsync = USART_INITASYNC_DEFAULT;
  initAsync.baudrate = 57600;
  initAsync.enable = usartDisable;
  USART_InitAsync(USART0, &initAsync);

  USART_IntClear(USART0, _USART_IF_MASK);

  USART_IntClear(USART0, USART_IF_RXDATAV);
  USART0->CMD_SET = USART_CMD_CLEARRX;
  USART0->CMD_SET = USART_CMD_CLEARTX;

   /* Enable RX interrupts */

  USART_IntEnable(USART0, USART_IEN_RXDATAV);


  USART_IntEnable(USART0, USART_IEN_TCMP1);
 // USART0->TIMECMP1_SET = USART_TIMECMP1_RESTARTEN_ENABLE;

  USART0->TIMECMP1_SET = USART_TIMECMP1_TSTOP_RXACT;
  USART0->TIMECMP1_SET = USART_TIMECMP1_TSTART_RXEOF;

  USART0->TIMECMP1_SET = 0x00000008UL << 0;


  NVIC_ClearPendingIRQ(USART0_RX_IRQn);
  NVIC_EnableIRQ(USART0_RX_IRQn);
  NVIC_ClearPendingIRQ(USART0_TX_IRQn);
  NVIC_EnableIRQ(USART0_TX_IRQn);

  USART_Enable(USART0, usartEnable);
}
void send_data(uint8_t pack[],uint8_t size)
{
  for(uint8_t i = 0;i<size;i++)
    {
      USART_Tx(USART0, pack[i]);
    }
  USART_IntClear(USART0, USART_IF_TXC);
  USART_IntClear(USART0, USART_IF_TXBL);
}
void get_data(uint8_t data[],uint8_t rx[],uint8_t idx)
{
  for(uint8_t i=0;i<idx;i++)
    {
      data[i] = rx[i];
    }
}


