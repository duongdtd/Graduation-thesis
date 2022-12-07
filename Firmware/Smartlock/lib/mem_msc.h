/*
 * mem_msc.h
 *
 *  Created on: Jul 1, 2022
 *      Author: ADMIN
 */
#include "stdint.h"
#ifndef LIB_MEM_MSC_H_
#define LIB_MEM_MSC_H_


#define USERDATA ((uint32_t*)USERDATA_BASE)

void mem_init();
uint32_t dec_to_hex(uint8_t data[], uint8_t len);
void mem_write(uint8_t pass[],uint8_t len,uint16_t position);
uint32_t mem_read(uint16_t position);
#endif /* LIB_MEM_MSC_H_ */
