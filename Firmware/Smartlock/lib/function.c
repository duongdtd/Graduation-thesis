/*
 * function.c
 *
 *  Created on: Jul 1, 2022
 *      Author: ADMIN
 */
#include"stdint.h"
#include"stdio.h"
#include"sl_status.h"
#include "gatt_db.h"
#include "sl_app_log.h"
#include "function.h"

void
send_status_ble (uint8_t *notifyEnabled, uint8_t *app_connection,uint8_t header ,uint8_t data,uint8_t pub_key,uint8_t *pri_key)
{
  sl_status_t sc;
  uint8_t buffer[3];
  uint16_t len = 2;
  buffer[0] = header;
  buffer[1] = data;
  uint8_t tmp_pri_key;
  encode(buffer, len, pub_key, pri_key,&tmp_pri_key);
  buffer[2] = tmp_pri_key;
  if (*notifyEnabled)
    {
      sc = sl_bt_gatt_server_send_notification (*app_connection, gattdb_App_ch,
                                                len+1, buffer);
    }
  if (sc == SL_STATUS_OK)
    {
      app_log("send ok\n");
    }
  else
    app_log("send erorr\n");

}
void
send_status_ble_monitor (uint8_t *notifyEnabled, uint8_t *app_connection,
                         uint8_t data,uint8_t pub_key,uint8_t *pri_key)
{
  sl_status_t sc;
  uint8_t buffer[3];
  uint16_t len = 2;
  buffer[0] = 2;
  buffer[1] = data;
  uint8_t tmp_pri_key;
  encode(buffer, len, pub_key, pri_key,&tmp_pri_key);
  buffer[2] = tmp_pri_key;
  if (*notifyEnabled)
    {
      sc = sl_bt_gatt_server_send_notification (*app_connection, gattdb_App_ch,
                                                len+1, buffer);
    }
  if (sc == SL_STATUS_OK)
    {
      app_log("send ok\n");
    }
  else
    app_log("send erorr\n");

}
void
send_status_ble_id (uint8_t *notifyEnabled, uint8_t *app_connection,
                    uint8_t data, uint8_t fingerId)
{
  sl_status_t sc;
  uint8_t buffer[3];
  uint16_t len = 3;
  buffer[0] = 1;
  buffer[1] = data;
  buffer[2] = fingerId;
  if (*notifyEnabled)
    {
      sc = sl_bt_gatt_server_send_notification (*app_connection, gattdb_App_ch,
                                                len, buffer);
    }
  if (sc == SL_STATUS_OK)
    {
      app_log("send ok\n");
    }
  else
    app_log("send erorr\n");

}
void
send_ble_client (uint8_t *app_connection,
                    uint8_t data, uint8_t fingerId)
{
  sl_status_t sc;
  uint8_t buffer[3];
  uint16_t len = 3;
  buffer[0] = 1;
  buffer[1] = data;
  buffer[2] = fingerId;
  sc = sl_bt_gatt_server_send_notification(*app_connection, gattdb_App_ch, len, buffer);

  if (sc == SL_STATUS_OK){
      app_log("send ok\n");
  }
  else
    app_log("send erorr\n");

}
void
encode (uint8_t buffer[], uint8_t len, uint8_t pub_key, uint8_t *pri_key,uint8_t *temp)
{
  *pri_key = rand () % 20;
  *temp = *pri_key;
  *pri_key += pub_key;
  uint8_t i;
for(i = 0;i<len;i++)
  {
    buffer[i] += *pri_key;
  }
}
uint8_t
decode (uint8_t value, uint8_t pub_key, uint8_t pri_key)
{
return value - pub_key - pri_key -48;
}
