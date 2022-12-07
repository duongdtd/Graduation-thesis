/*
 * memory.c
 *
 *  Created on: Jul 1, 2022
 *      Author: ADMIN
 */
#include <lib/mem_msc.h>
#include "em_msc.h"
#include "em_cmu.h"
#include "memory.h"
#include "stdint.h"
#include "sl_app_log.h"
uint32_t dec_to_hex(uint8_t data[], uint8_t len)
{
  uint32_t password = 0;
  for(int i=0;i<len;i++)
    {
      password = password|data[i]<<(len*4-(i+1)*4);
    }
  return password;
}
void mem_init()
{
  CMU_ClockEnable(cmuClock_MSC, true);
}
void mem_write(uint8_t pass[],uint8_t len,uint16_t position)
{
  uint32_t password = dec_to_hex(pass,len);
  app_log("\nlen :%d --- %x\n",len,password);
  MSC_Init();
  MSC_WriteWord(USERDATA + position, &password, 4);
  MSC_Deinit();
}
uint32_t mem_read(uint16_t position)
{
  uint32_t data = USERDATA[position];
  return data;
  }
void mem_clear(uint8_t strart_pos)
{
  MSC_ErasePage(USERDATA);
}
