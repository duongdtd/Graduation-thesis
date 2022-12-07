/*
 * lcd.h
 *
 *  Created on: Jun 29, 2022
 *      Author: ADMIN
 */

#ifndef LIB_LCD_H_
#define LIB_LCD_H_



#define LCD_ADDR 0x27 // change this according to ur setup
void lcd_init();
void lcd_send_cmd(char cmd);
void lcd_send_data(char data);
void lcd_clear();
void lcd_send_string(char *a);
void lcd_goto_XY (int row, int col);
void lcd_on_display();
void lcd_off_display();
#endif /* LIB_LCD_H_ */
