
/*
 * adc_1.c
 *
 *  Created on: Nov 24, 2022
 *      Author: ADMIN
 */

#include "em_device.h"
#include "em_chip.h"
#include "em_cmu.h"
#include "em_emu.h"
#include "em_iadc.h"
#include "em_gpio.h"



#define CLK_SRC_ADC_FREQ      40000000    // CLK_SRC_ADC
#define CLK_ADC_FREQ          10000000  // CLK_ADC - 10 MHz max in normal mode


#define IADC_INPUT_0_PORT_PIN     iadcPosInputPortBPin0;

#define IADC_INPUT_0_BUS          BBUSALLOC
#define IADC_INPUT_0_BUSALLOC     GPIO_BBUSALLOC_BEVEN0_ADC0


void initIADC (void)
{

   IADC_Init_t init = IADC_INIT_DEFAULT;
   IADC_AllConfigs_t initAllConfigs = IADC_ALLCONFIGS_DEFAULT;
   IADC_InitSingle_t initSingle = IADC_INITSINGLE_DEFAULT;

   // Single input structure
   IADC_SingleInput_t singleInput = IADC_SINGLEINPUT_DEFAULT;
   CMU_ClockEnable(cmuClock_IADC0, true);
   CMU_ClockEnable(cmuClock_GPIO, true);


   // Use the FSRC0 as the IADC clock so it can run in EM2
   CMU_ClockSelectSet(cmuClock_IADCCLK, cmuSelect_FSRCO);

   // Set the prescaler needed for the intended IADC clock frequency
   init.srcClkPrescale = IADC_calcSrcClkPrescale(IADC0, CLK_SRC_ADC_FREQ, 0);

   // Shutdown between conversions to reduce current
   init.warmup = iadcWarmupNormal;

   /*
    * Configuration 0 is used by both scan and single conversions by
    * default.  Use internal bandgap as the reference and specify the
    * reference voltage in mV.
    *
    * Resolution is not configurable directly but is based on the
    * selected oversampling ratio (osrHighSpeed), which defaults to
    * 2x and generates 12-bit results.
    */

   initAllConfigs.configs[0].reference = iadcCfgReferenceInt1V2;
   initAllConfigs.configs[0].vRef = 1210;
   initAllConfigs.configs[0].osrHighSpeed = iadcCfgOsrHighSpeed2x;
   initAllConfigs.configs[0].analogGain = iadcCfgAnalogGain0P5x;

   /*
    * CLK_SRC_ADC must be prescaled by some value greater than 1 to
    * derive the intended CLK_ADC frequency.
    *
    * Based on the default 2x oversampling rate (OSRHS)...
    *
    * conversion time = ((4 * OSRHS) + 2) / fCLK_ADC
    *
    * ...which results in a maximum sampling rate of 833 ksps with the
    * 2-clock input multiplexer switching time is included.
    */

   initAllConfigs.configs[0].adcClkPrescale = IADC_calcAdcClkPrescale(IADC0,
                                                                      CLK_ADC_FREQ,
                                                                      0,
                                                                      iadcCfgModeNormal,
                                                                      init.srcClkPrescale);



   singleInput.posInput   = IADC_INPUT_0_PORT_PIN;
   singleInput.negInput   = iadcNegInputGnd;

   // Allocate the analog bus for ADC0 inputs
   GPIO->IADC_INPUT_0_BUS |= IADC_INPUT_0_BUSALLOC;

   // Initialize IADC
   IADC_init(IADC0, &init, &initAllConfigs);

   // Initialize a single-channel conversion
   IADC_initSingle(IADC0, &initSingle, &singleInput);

   // Clear any previous interrupt flags
   IADC_clearInt(IADC0, _IADC_IF_MASK);

   // Enable single-channel done interrupts
   IADC_enableInt(IADC0, IADC_IEN_SINGLEDONE);

   // Enable IADC interrupts
   NVIC_ClearPendingIRQ(IADC_IRQn);
   NVIC_EnableIRQ(IADC_IRQn);
}
