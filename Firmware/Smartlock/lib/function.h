/*
 * function.h
 *
 *  Created on: Jul 1, 2022
 *      Author: ADMIN
 */

#ifndef LIB_FUNCTION_H_
#define LIB_FUNCTION_H_

void send_status_ble (uint8_t *notifyEnabled, uint8_t *app_connection,uint8_t header ,uint8_t data,uint8_t pub_key,uint8_t *pri_key);
void send_status_ble_id (uint8_t *notifyEnabled, uint8_t *app_connection,
                    uint8_t data, uint8_t fingerId);
void send_status_ble_monitor (uint8_t *notifyEnabled, uint8_t *app_connection,
                              uint8_t data,uint8_t pub_key,uint8_t *pri_key);
void
send_ble_client (uint8_t *app_connection,
                    uint8_t data, uint8_t fingerId);
void encode(uint8_t buffer[], uint8_t len, uint8_t pub_key, uint8_t *pri_key,uint8_t *temp);
uint8_t
decode (uint8_t value, uint8_t pub_key, uint8_t pri_key);
#endif /* LIB_FUNCTION_H_ */
