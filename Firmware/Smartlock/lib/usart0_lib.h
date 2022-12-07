/*
 * usart.h
 *
 *  Created on: Jul 2, 2022
 *      Author: ADMIN
 */
#include "stdint.h"
#ifndef LIB_USART_CONFIG_H_
#define LIB_USART_CONFIG_H_

#define RX_Port gpioPortB
#define RX_Pin 2

#define TX_Port gpioPortB
#define TX_Pin 1

void usart_init_();
void send_data(uint8_t pack[],uint8_t size);
void get_data(uint8_t data[],uint8_t rx[],uint8_t idx);
#endif /* LIB_USART_CONFIG_H_ */
