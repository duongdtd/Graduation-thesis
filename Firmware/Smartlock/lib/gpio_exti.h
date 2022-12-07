/*
 * gpio_exti.h
 *
 *  Created on: Jun 29, 2022
 *      Author: ADMIN
 */
#include "stdint.h"

#ifndef GPIO_EXTI_H_
#define GPIO_EXTI_H_

// ROW
#define Row1_Port   gpioPortC
#define Row1_pin  3

#define Row2_Port   gpioPortC
#define Row2_pin  2

#define Row3_Port   gpioPortC
#define Row3_pin  1

#define Row4_Port   gpioPortC
#define Row4_pin  0
// COLUMN
#define Col1_Port   gpioPortC
#define Col1_pin  6

#define Col2_Port   gpioPortA
#define Col2_pin  4

#define Col3_Port   gpioPortB
#define Col3_pin  4


#define AS608_Port gpioPortC
#define AS608_pin 7

#define  motor_port      gpioPortB
#define  motor_pin       3

void GPIO_EXTI_Init();
void ad5940_gpio_ext_handler (uint32_t int_num);
void run_motor();
#endif /* GPIO_EXTI_H_ */
