CoDeSys+1   �                   @        @   2.3.9.36�   @   ConfigExtension�         CommConfigEx7             CommConfigExEnd   ME�                  IB                    % QB                    %   ME_End   CM�      CM_End   CT�   ��������   CT_End   ME                 IB                    % QB                    %   ME_End   CM.     CM_End   CTJ  ��������   CT_End   ME�                 IB                    % QB                    %   ME_End   CM�     CM_End   CT�  ��������   CT_End   ConfigExtensionEnd?    @                                     oJ�R +    @      ��������             `��R        6   @   Z   C:\PROGRAM FILES (X86)\3S SOFTWARE\CODESYS V2.3\TARGETS\WAGO\LIBRARIES\32_BIT\STANDARD.LIB          ASCIIBYTE_TO_STRING               byt           ��                 ASCIIBYTE_TO_STRING                                         )��K  �   ����           CONCAT               STR1               ��              STR2               ��                 CONCAT                                         )��K  �   ����           CTD           M             ��           Variable for CD Edge Detection      CD            ��           Count Down on rising edge    LOAD            ��	           Load Start Value    PV           ��
           Start Value       Q            ��           Counter reached 0    CV           ��           Current Counter Value             )��K  �   ����           CTU           M             ��            Variable for CU Edge Detection       CU            ��       
    Count Up    RESET            ��	           Reset Counter to 0    PV           ��
           Counter Limit       Q            ��           Counter reached the Limit    CV           ��           Current Counter Value             )��K  �   ����           CTUD           MU             ��            Variable for CU Edge Detection    MD             ��            Variable for CD Edge Detection       CU            ��
       
    Count Up    CD            ��           Count Down    RESET            ��           Reset Counter to Null    LOAD            ��           Load Start Value    PV           ��           Start Value / Counter Limit       QU            ��           Counter reached Limit    QD            ��           Counter reached Null    CV           ��           Current Counter Value             )��K  �   ����           DELETE               STR               ��              LEN           ��	              POS           ��
                 DELETE                                         )��K  �   ����           F_TRIG           M             ��                 CLK            ��           Signal to detect       Q            ��	           Edge detected             )��K  �   ����           FIND               STR1               ��	              STR2               ��
                 FIND                                     )��K  �   ����           INSERT               STR1               ��	              STR2               ��
              POS           ��                 INSERT                                         )��K  �   ����           LEFT               STR               ��              SIZE           ��                 LEFT                                         )��K  �   ����           LEN               STR               ��                 LEN                                     )��K  �   ����           MID               STR               ��              LEN           ��	              POS           ��
                 MID                                         )��K  �   ����           R_TRIG           M             ��                 CLK            ��           Signal to detect       Q            ��	           Edge detected             )��K  �   ����        
   REAL_STATE               RESET            ��           Reset the variable       ERROR           ��           Error detected             )��K  �   ����           REPLACE               STR1               ��	              STR2               ��
              L           ��              P           ��                 REPLACE                                         )��K  �   ����           RIGHT               STR               ��              SIZE           ��                 RIGHT                                         )��K  �   ����           RS               SET            ��              RESET1            ��	                 Q1            ��                       )��K  �   ����           RTC           M             ��              DiffTime            ��                 EN            ��              PDT           ��                 Q            ��              CDT           ��                       )��K  �   ����           SEMA           X             ��                 CLAIM            ��
              RELEASE            ��                 BUSY            ��                       )��K  �   ����           SR               SET1            ��              RESET            ��                 Q1            ��                       )��K  �   ����           STANDARD_VERSION               EN            ��                 STANDARD_VERSION                                     )��K  �   ����           STRING_COMPARE               STR1               ��              STR2               ��                 STRING_COMPARE                                      )��K  �   ����           STRING_TO_ASCIIBYTE               str               ��                 STRING_TO_ASCIIBYTE                                     )��K  �   ����           TOF           M             ��           internal variable 	   StartTime            ��           internal variable       IN            ��       ?    starts timer with falling edge, resets timer with rising edge    PT           ��           time to pass, before Q is set       Q            ��       2    is FALSE, PT seconds after IN had a falling edge    ET           ��           elapsed time             )��K  �   ����           TON           M             ��           internal variable 	   StartTime            ��           internal variable       IN            ��       ?    starts timer with rising edge, resets timer with falling edge    PT           ��           time to pass, before Q is set       Q            ��       0    is TRUE, PT seconds after IN had a rising edge    ET           ��           elapsed time             )��K  �   ����           TP        	   StartTime            ��           internal variable       IN            ��       !    Trigger for Start of the Signal    PT           ��       '    The length of the High-Signal in 10ms       Q            ��           The pulse    ET           ��       &    The current phase of the High-Signal             )��K  �   ����    `   C:\PROGRAM FILES (X86)\3S SOFTWARE\CODESYS V2.3\TARGETS\WAGO\LIBRARIES\32_BIT\SYSLIBCALLBACK.LIB          SYSCALLBACKREGISTER            	   iPOUIndex           ��       !    POU Index of callback function.    Event            	   RTS_EVENT   ��           Event to register       SysCallbackRegister                                      )��K  �   ����           SYSCALLBACKUNREGISTER            	   iPOUIndex           ��       !    POU Index of callback function.    Event            	   RTS_EVENT   ��           Event to register       SysCallbackUnregister                                      )��K  �   ����                  PLC_PRG           bAlarmFarbe             .               bVarToggeln             .            
   bVarTasten             .               bVarFalseTasten             .               dwCount            . 	              dwUpDown            .               bUpDown            .                                ��R  @    ����            
 �   .      0   /   ( $!      K   2!     K   @!     K   N!     K   c!                 p!         +           �  �      AUX)K^�� PWW�           Ethernet_TCP_IP testProjekt.pro WAGOobergeschossNB WAGO Ethernet TCP/IP Treiber    A   �  IP Adresse IP Addresse des Zielknotens 
   192.168.2.157 >   �  Portnummer Portnummer des Zielknotens    �	      ��  V   �  Transport Protokoll Benutztes Transport Protokoll               tcp    udp =   �  Debug Stufe Immer 0, nur f�r internen Gebrauch      �         �      AUX)K^�� PWW�            Ethernet_TCP_IP test1.pro WAGOerdgeschoss WAGO Ethernet TCP/IP Treiber    A   �  IP Adresse IP Addresse des Zielknotens 
   192.168.2.155 >   �  Portnummer Portnummer des Zielknotens    �	      ��  V   �  Transport Protokoll Benutztes Transport Protokoll               tcp    udp =   �  Debug Stufe Immer 0, nur f�r internen Gebrauch        K         @   ��R_E        ��������                     CoDeSys 1-2.2   ����  ��������                     �.  4       �      
   �         �         �          �                    "          $                                                   '          (          �          �          �          �          �         �          �          �          �         �          �          �          �          �         �      �   �       P  �          �         �       �  �                    ~          �          �          �          �          �          �          �          �          �          �          �          �          �          �          �          �          �       @  �       @  �       @  �       @  �       @  �       @  �         �         �          �       �  M         N          O          P          `         a          t          y          z          b         c          X          d         e         _          Q          \         R          K          U         X         Z         �          �         �      
   �         �         �         �         �         �          �          �         �      �����          �          �      (                                                                        "         !          #          $         �          ^          f         g          h          i          j          k         F          H         J         L          N         P         R          U         S          T          V          W          �          �          l          o          p          q          r          s         u          �          v         �          �      ����|         ~         �         x          z      (   �          �         %         �          �          �         @         �          �          �         &          �          	                   �          �          �         �          �         �          �          �          �          �          �          �          �          �          �          �          �                            I         J         K          	          L         M          �                             �          P         Q          S          )          	          	          �           	          +	       @  ,	       @  -	      ���������������������������������������������������������.  �         �         �          �                    "          $                                                   '          (          �          �          �          �          �         �          �          �          �         �          �          �          �          �         �      �   �       P  �          �         �       �  �          �         0�       � �          �       @  �      �  �         a          t          y          z          b          c          X          d         e         _         \         R          K          U        UDPX         Z         �          �         �      
   �         �         �         �         �         �          �          �         �      �����          �          �      (   "          #         $          �          g          h          i         j          k         F          H         J         L          N         P         R          U         S          T          V          W          �          o          p          q          r          s          u          �          v         w         �         |         ~         �         x          z      (   �          %         �          �          �         @         �          �         �      X  �          �         &        ���          	                   �          �          �         �          �         �          �          �          �          �          �          �          �          �          �          �          �         �          �          �                                       I         J         K          	          L         M          �                             �          P         Q          S          )          	          	          �           	          +	       @  ,	       @  -	      ������������������������������������������������������������������������������������������������������������������������������������������������������������������������  ��������                                                   �  	   	   Name                 ����
   Index                 ��         SubIndex                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Variable    	             ����
   Value                Variable       Min                Variable       Max                Variable          5  
   	   Name                 ����
   Index                 ��         SubIndex                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write    	   Type          ~         INT   UINT   DINT   UDINT   LINT   ULINT   SINT   USINT   BYTE   WORD   DWORD   REAL   LREAL   STRING    
   Value                Type       Default                Type       Min                Type       Max                Type          5  
   	   Name                 ����
   Index                 ��         SubIndex                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write    	   Type          ~         INT   UINT   DINT   UDINT   LINT   ULINT   SINT   USINT   BYTE   WORD   DWORD   REAL   LREAL   STRING    
   Value                Type       Default                Type       Min                Type       Max                Type          d        Member    	             ����   Index-Offset                 ��         SubIndex-Offset                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Min                Member       Max                Member          �  	   	   Name                 ����   Member    	             ����
   Value                Member    
   Index                 ��         SubIndex                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Min                Member       Max                Member          �  	   	   Name                 ����
   Index                 ��         SubIndex                 �          Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Variable    	             ����
   Value                Variable       Min                Variable       Max                Variable                         ����  ��������               �   _Dummy@    @   @@    @   @             ��@             ��@@   @     �v@@   ; @+   ����  ��������                                  �v@      4@   �             �v@      D@   �                       �       @                           �f@      4@     �f@                �v@     �f@     @u@     �f@        ���             Module.Root-1__not_found__    Hardware configuration���� IB          % QB          % MB          %   o     Module.K_Bus1Module.Root    K-Bus     IB          % QB          % MB          %    o     Module.FB_VARS2Module.Root    Fieldbus variables    IB          % QB          % MB          %    ��R	��R     ��������           VAR_GLOBAL
END_VAR
                                                                                  "   , 2 2 �V              ��R                   start   Called when program starts    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     stop   Called when program stops    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     before_reset   Called before reset takes place    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     after_reset   Called after reset took place    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     shutdownC   Called before shutdown is performed (Firmware update over ethernet)    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     excpt_watchdog%   Software watchdog of IEC-task expired    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     excpt_fieldbus   Fieldbus error    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  	   �.     excpt_ioupdate
   KBus error    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  
   �.     excpt_dividebyzero*   Division by zero. Only integer operations!    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     excpt_noncontinuable   Exception handler    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     after_reading_inputs   Called after reading of inputs    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     before_writing_outputs    Called before writing of outputs    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.  
   debug_loop   Debug loop at breakpoint    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     �.     online_change+   Is called after CodeInit() at Online-Change    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  !   �.     before_download$   Is called before the Download starts    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  "   �.     event_login/   Is called before the login service is performed    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  �  �.     eth_overload   Ethernet Overload    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  �  �.     eth_network_ready@   Is called directly after the Network and the PLC are initialised    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  �  �.  
   blink_codeN   New blink code / Blink code cleared ( Call STATUS_GET_LAST_ERROR for details )    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  �  �.     interrupt_0(   Interrupt Real Time Clock (every second)    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  �  �.  $����  ��������               ��������           Standard `��R	`��R      ��������                         	��R     ��������           VAR_CONFIG
END_VAR
                                                                                   '                ��������           Globale_Variablen ��R	��R     ��������           VAR_GLOBAL
END_VAR
                                                                                               '           	     ��������           Variablen_Konfiguration ��R	��R	     ��������           VAR_CONFIG
END_VAR
                                                                                                 �   |0|0 @�    @c   Lucida Sans Typewriter @       HH':'mm':'ss @      dd'-'MM'-'yyyy   dd'-'MM'-'yyyy HH':'mm':'ss�����                               =     �   ���  �3 ���   � ���     
    @��  ���     @      DEFAULT             System      �   |0|0 @�    @c   Lucida Sans Typewriter @       HH':'mm':'ss @      dd'-'MM'-'yyyy   dd'-'MM'-'yyyy HH':'mm':'ss�����                      )   HH':'mm':'ss @                             dd'-'MM'-'yyyy @        '            .   , !   %8           PLC_PRG x2�R	��R      ��������          (* Testprogramm f�r WebVisu *)
PROGRAM PLC_PRG
VAR
	bAlarmFarbe		: BOOL	:= FALSE;
	bVarToggeln		: BOOL	:= FALSE;
	bVarTasten		: BOOL	:= FALSE;
	bVarFalseTasten	: BOOL	:= FALSE;

	dwCount			: DWORD	:= 0;

	dwUpDown		: DWORD	:= 0;
	bUpDown			: BOOL	:= TRUE;
END_VAR�   dwCount := dwCount + 1;


IF bUpDown = TRUE THEN
	dwUpDown := dwUpDown + 1;
	IF dwUpDown >= 5000 THEN
		bUpDown := FALSE;
	END_IF
ELSE
	dwUpDown := dwUpDown - 1;
	IF dwUpDown <= 0 THEN
		bUpDown := TRUE;
	END_IF
END_IF




                /   ,   U           PLC_VISU ��R
    @�XanJ�R'   d   "                                                                                                       
    @        
 
 y 3 A    ���     ���                                             @                           ���                              @                                                                                                          
    @        
 < y e A P   ���     ���                                             @                          ���                              @                                                                                                          
    @        
 n y � A �   ���     ���                                             @                          ���                              @                                                                                                          
    @        
 � y � A �   ���     ���                                             @                          ���                              @                                                                                                           
    @        � 
 � 3 �    ���     ���                                            Links / Oben @                           ���                              @                                                                                                           
    @        � 
 i3 1   ���     ���                                            Zentr. / Zentr. @                          ���                              @                                                                                                           
    @        r
 �3 �   ���     ���                                            Rechts / Unten @                         
 ���                              @                                                                                                           
    @        �
 Y3 !   ��� ��   �� �                                  PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          ���               PLC_PRG.bAlarmFarbe             @                                                                                                          
    @        � < � e � P   ���     ���                                            Links / Oben @                           ���                              @                                                                                                          
    @        � < ie 1P   ���     ���                                            Zentr. / Zentr. @                      	    ���                              @                                                                                                          
    @        r< �e �P   ���     ���                                            Rechts / Unten @                      
   
 ���                              @                                                                                                          
    @        �< Ye !P   ��� ��   �� �                                  PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          ���               PLC_PRG.bAlarmFarbe             @                                                                                                          
    @        � n � � � �   ���     ���                                            Links / Oben @                           ���                              @                                                                                                          
    @        � n i� 1�   ���     ���                                            Zentr. / Zentr. @                          ���                              @                                                                                                          
    @        rn �� ��   ���     ���                                            Rechts / Unten @                         
 ���                              @                                                                                                          
    @        �n Y� !�   ��� ��   �� �                                  PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          ���               PLC_PRG.bAlarmFarbe             @                                                                                                           
    @        
 � y A �   ���     ���                                            Var. toggeln @                          ���           PLC_PRG.bVarToggeln                 @                                                                                                          
    @        
 y 7A "  ���     ���                                            Var. toggeln @                          ���           PLC_PRG.bVarToggeln                 @                                                                                                          
    @        
 @y iA T  ���     ���                                            Var. toggeln @                          ���           PLC_PRG.bVarToggeln                 @                                                                                                           
    @        � � � � �   ���     ���                                            Var. tasten @                          ���               PLC_PRG.bVarTasten             @                                                                                                          
    @        � � 7� "  ���     ���                                            Var. tasten @                          ���               PLC_PRG.bVarTasten             @                                                                                                          
    @        � @� i� T  ���     ���                                            Var. tasten @                          ���               PLC_PRG.bVarTasten             @                                                                                                           
    @        � � i1�   ���     ���                                            Var. FALSE 
tasten @                          ���               PLC_PRG.bVarFalseTasten            @                                                                                                          
    @        � i71"  ���     ���                                            Var. FALSE 
tasten @                          ���               PLC_PRG.bVarFalseTasten            @                                                                                                          
    @        � @ii1T  ���     ���                                            Var. FALSE 
tasten @                          ���               PLC_PRG.bVarFalseTasten            @                                                                                                           
    @        2 rQ �A �  ���     �                                      PLC_PRG.bVarToggeln        @                          ���                              @                                                                                                           
    @        � r� �� �  ���     �                                      PLC_PRG.bVarTasten        @                          ���                              @                                                                                                           
    @        "rA�1�  ���     �                                      PLC_PRG.bVarFalseTasten        @                          ���                              @                                                                                                           
    @        �rY�!�  ���     ���                                            next @                           ���                             @ 
   PLC_VISU_2                                                                                                      
    @        �� ���   ���     ���                                             @                      "    ���                              @                                                                                                           
    @        �� �� ��   ��      ���                        PLC_PRG.dwUpDown / 50                    @                      #    ���                              @                                                                                                           
    @        �� Y� !�   ���     ���                                        1 AND 1 OR 1   AND/OR 1==%s @                      $    ���                              @                                                                                                           
    @        �� Y !�   ���     ���                                     	   3 - 2 + 4   ADD/SUB 5==%s @                      %    ���                              @                                                                                                           
    @        �	Y-!  ���     ���                                     	   6 / 2 * 3   MUL/DIV 9==%s @                      &    ���                              @             �   ��   �   ��   � � � ���     �   ��   �   ��   � � � ���                  0   , , : r        
   PLC_VISU_2 ��R
    @>�Ԝy1�R   d   
                                                                                                     
    @            !Y�,      ���     ���            images\hintergrund.jpg                       �               @                     ���                                      ���                                                                                                       
    @        �rY�!�  ���     ���                                            prev @                          ���                             @    PLC_VISU                                                                                                    
    @        
 
 y 3 A        ���     ���            images\button40blue.jpg                       �               @                     ���                                      ���                                                                                                     
    @        � 
 � 3 �        ���     ���     ���    images\button40blue.jpg                       �               @                     ���       Arial                   Dies ist ein Test          ���                                                                                                     
    @        � 
 i3 1       ���     ���            images\button40blue.jpg                       �              @                     ���           PLC_PRG.bVarToggeln               Var Toggeln          ���                                                                                                     
    @        r
 �3 �       ���     ���            images\button40blue.jpg                       �              @                 	    ���               PLC_PRG.bVarTasten        
   Var Tasten          ���                                                                                                     
    @        �
 Y3 !       ���     ���            images\button40blue.jpg                       �             @                 
    ���               PLC_PRG.bVarFalseTasten           Var FALSE Tasten          ���                                                                                                       
    @        "F Ae 1U   ���     �                                      PLC_PRG.bVarToggeln        @                          ���                              @                                                                                                           
    @        �F �e �U   ���     �                                      PLC_PRG.bVarTasten        @                          ���                              @                                                                                                           
    @        F 1e !U   ���     �                                      PLC_PRG.bVarFalseTasten        @                          ���                              @             �   ��   �   ��   � � � ���     �   ��   �   ��   � � � ���                  ����  ��������         #   Standard.lib 26.3.10 13:18:49 @)��K)   SYSLIBCALLBACK.LIB 26.3.10 13:18:49 @)��K   !   ASCIIBYTE_TO_STRING @                  CONCAT @        	   CTD @        	   CTU @        
   CTUD @           DELETE @           F_TRIG @        
   FIND @           INSERT @        
   LEFT @        	   LEN @        	   MID @           R_TRIG @           REAL_STATE @          REPLACE @           RIGHT @           RS @        	   RTC @        
   SEMA @           SR @           STANDARD_VERSION @          STRING_COMPARE @          STRING_TO_ASCIIBYTE @       	   TOF @        	   TON @           TP @              Global Variables 0 @           b   SysCallbackRegister @   	   RTS_EVENT       RTS_EVENT_FILTER       RTS_EVENT_SOURCE                   SysCallbackUnregister @              Globale_Variablen @           Version @                          ��������           2 �  �           ����������������  
             ����  ��������        ����  ��������                   	   Bausteine                PLC_PRG  .   ����          
   Datentypen  ����              Visualisierungen                PLC_VISU  /                
   PLC_VISU_2  0   ����               Globale Variablen                 Globale_Variablen                     Variablen_Konfiguration  	   ����                                         ��������             b��R�.             �.                	   localhost            P      	   localhost            P      	   localhost            P     nJ�R  �V�: