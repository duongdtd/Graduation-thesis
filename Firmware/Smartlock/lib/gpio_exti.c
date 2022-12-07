/*
 * gpio_exti.c
 *
 *  Created on: Jun 29, 2022
 *      Author: ADMIN
 */


/*
 * gpio.c
 *
 *  Created on: Jun 29, 2022
 *      Author: ADMIN
 */
#include <lib/gpio_exti.h>
#include "stdint.h"
#include "em_chip.h"
#include "em_gpio.h"
#include "gpiointerrupt.h"
#include "em_cmu.h"
#include "sl_pwm.h"
#include "sl_pwm_instances.h"
#include "sl_pwm_init_motor_config.h"

void GPIO_EXTI_Init()
{
CMU_ClockEnable(cmuClock_GPIO, true);
GPIOINT_Init();
// ROW
GPIO_PinModeSet(Row1_Port, Row1_pin, gpioModeWiredAndPullUpFilter, 1);
GPIO_PinModeSet(Row2_Port, Row2_pin, gpioModeWiredAndPullUpFilter, 1);
GPIO_PinModeSet(Row3_Port, Row3_pin, gpioModeWiredAndPullUpFilter, 1);
GPIO_PinModeSet(Row4_Port, Row4_pin, gpioModeWiredAndPullUpFilter, 1);
GPIO_PinModeSet(AS608_Port, AS608_pin, gpioModeWiredAndPullUpFilter, 1);
//COLUMN
GPIO_PinModeSet(Col1_Port, Col1_pin, gpioModePushPull, 1);
GPIO_PinModeSet(Col2_Port, Col2_pin, gpioModePushPull, 1);
GPIO_PinModeSet(Col3_Port, Col3_pin, gpioModePushPull, 1);
//motor
GPIO_PinModeSet (motor_port,motor_pin, gpioModePushPull, 0);
//EXTI
GPIO_ExtIntConfig(Row1_Port, Row1_pin, Row1_pin, false, true, true);
GPIO_ExtIntConfig(Row2_Port, Row2_pin, Row2_pin, false, true, true);
GPIO_ExtIntConfig(Row3_Port, Row3_pin, Row3_pin, false, true, true);
GPIO_ExtIntConfig(Row4_Port, Row4_pin, Row4_pin, false, true, true);
GPIO_ExtIntConfig(AS608_Port, AS608_pin, AS608_pin, true, false, true);

//
GPIOINT_CallbackRegister (Row1_pin, (void*) ad5940_gpio_ext_handler);
GPIOINT_CallbackRegister (Row2_pin, (void*) ad5940_gpio_ext_handler);
GPIOINT_CallbackRegister (Row3_pin, (void*) ad5940_gpio_ext_handler);
GPIOINT_CallbackRegister (Row4_pin, (void*) ad5940_gpio_ext_handler);
GPIOINT_CallbackRegister (AS608_pin, (void*) ad5940_gpio_ext_handler);



}
void ad5940_gpio_ext_handler (uint32_t int_num)
{
  if (int_num == Row1_pin)
    {
      sl_bt_external_signal (3);
    }
   if (int_num == Row2_pin)
    {
      sl_bt_external_signal (Row2_pin);
    }
   if (int_num == Row3_pin)
    {
      sl_bt_external_signal (Row3_pin);
    }
   if (int_num == Row4_pin)
    {
      sl_bt_external_signal (Row4_pin);
    }
   if(int_num == AS608_pin)
     {
       sl_bt_external_signal(AS608_pin);
     }
}
void set_motor ()
{
  GPIO_PinOutSet(motor_port, motor_pin);
  sl_pwm_set_duty_cycle(&sl_pwm_motor, 100);
  sl_pwm_start(&sl_pwm_motor);
}

/**
 *  @brief clear buzzer
 */
void clear_motor ()
{
    GPIO_PinOutClear(motor_port, motor_pin);
    sl_pwm_stop(&sl_pwm_motor);
}
void run_motor()
{
    set_motor();
    sl_sleeptimer_delay_millisecond(1000);
    clear_motor();
}
