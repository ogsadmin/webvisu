CoDeSys+1   М                   @        @   2.3.9.36ё   @   ConfigExtension┘         CommConfigEx7             CommConfigExEnd   MEХ                  IB                    % QB                    %   ME_End   CMй      CM_End   CT┼              CT_End   ME                 IB                    % QB                    %   ME_End   CM.     CM_End   CTJ             CT_End   MEЯ                 IB                    % QB                    %   ME_End   CM│     CM_End   CT╧             CT_End   ConfigExtensionEnd?    @                                     -6┌R +    @      ════════             `┐┬R        6   @   Z   C:\PROGRAM FILES (X86)\3S SOFTWARE\CODESYS V2.3\TARGETS\WAGO\LIBRARIES\32_BIT\STANDARD.LIB          ASCIIBYTE_TO_STRING               byt           ¤                  ASCIIBYTE_TO_STRING                                         !2┌R  А                  CONCAT               STR1               ¤               STR2               ¤                  CONCAT                                         !2┌R  А                  CTD           M             ¤            Variable for CD Edge Detection      CD            ¤            Count Down on rising edge    LOAD            ¤ 	           Load Start Value    PV           ¤ 
           Start Value       Q            ¤            Counter reached 0    CV           ¤            Current Counter Value             !2┌R  А                  CTU           M             ¤             Variable for CU Edge Detection       CU            ¤        
    Count Up    RESET            ¤ 	           Reset Counter to 0    PV           ¤ 
           Counter Limit       Q            ¤            Counter reached the Limit    CV           ¤            Current Counter Value             !2┌R  А                  CTUD           MU             ¤             Variable for CU Edge Detection    MD             ¤             Variable for CD Edge Detection       CU            ¤ 
       
    Count Up    CD            ¤            Count Down    RESET            ¤            Reset Counter to Null    LOAD            ¤            Load Start Value    PV           ¤            Start Value / Counter Limit       QU            ¤            Counter reached Limit    QD            ¤            Counter reached Null    CV           ¤            Current Counter Value             !2┌R  А                  DELETE               STR               ¤               LEN           ¤ 	              POS           ¤ 
                 DELETE                                         !2┌R  А                  F_TRIG           M             ¤                  CLK            ¤            Signal to detect       Q            ¤ 	           Edge detected             !2┌R  А                  FIND               STR1               ¤ 	              STR2               ¤ 
                 FIND                                     !2┌R  А                  INSERT               STR1               ¤ 	              STR2               ¤ 
              POS           ¤                  INSERT                                         !2┌R  А                  LEFT               STR               ¤               SIZE           ¤                  LEFT                                         !2┌R  А                  LEN               STR               ¤                  LEN                                     !2┌R  А                  MID               STR               ¤               LEN           ¤ 	              POS           ¤ 
                 MID                                         !2┌R  А                  R_TRIG           M             ¤                  CLK            ¤            Signal to detect       Q            ¤ 	           Edge detected             !2┌R  А               
   REAL_STATE               RESET            ¤            Reset the variable       ERROR           ¤            Error detected             !2┌R  А                  REPLACE               STR1               ¤ 	              STR2               ¤ 
              L           ¤               P           ¤                  REPLACE                                         !2┌R  А                  RIGHT               STR               ¤               SIZE           ¤                  RIGHT                                         !2┌R  А                  RS               SET            ¤               RESET1            ¤ 	                 Q1            ¤                        !2┌R  А                  RTC           M             ¤               DiffTime            ¤                  EN            ¤               PDT           ¤                  Q            ¤               CDT           ¤                        !2┌R  А                  SEMA           X             ¤                  CLAIM            ¤ 
              RELEASE            ¤                  BUSY            ¤                        !2┌R  А                  SR               SET1            ¤               RESET            ¤                  Q1            ¤                        !2┌R  А                  STANDARD_VERSION               EN            ¤                  STANDARD_VERSION                                     !2┌R  А                  STRING_COMPARE               STR1               ¤               STR2               ¤                  STRING_COMPARE                                      !2┌R  А                  STRING_TO_ASCIIBYTE               str               ¤                  STRING_TO_ASCIIBYTE                                     !2┌R  А                  TOF           M             ¤            internal variable 	   StartTime            ¤            internal variable       IN            ¤        ?    starts timer with falling edge, resets timer with rising edge    PT           ¤            time to pass, before Q is set       Q            ¤        2    is FALSE, PT seconds after IN had a falling edge    ET           ¤            elapsed time             !2┌R  А                  TON           M             ¤            internal variable 	   StartTime            ¤            internal variable       IN            ¤        ?    starts timer with rising edge, resets timer with falling edge    PT           ¤            time to pass, before Q is set       Q            ¤        0    is TRUE, PT seconds after IN had a rising edge    ET           ¤            elapsed time             !2┌R  А                  TP        	   StartTime            ¤            internal variable       IN            ¤        !    Trigger for Start of the Signal    PT           ¤        '    The length of the High-Signal in 10ms       Q            ¤            The pulse    ET           ¤        &    The current phase of the High-Signal             !2┌R  А           `   C:\PROGRAM FILES (X86)\3S SOFTWARE\CODESYS V2.3\TARGETS\WAGO\LIBRARIES\32_BIT\SYSLIBCALLBACK.LIB          SYSCALLBACKREGISTER            	   iPOUIndex           ¤        !    POU Index of callback function.    Event            	   RTS_EVENT   ¤            Event to register       SysCallbackRegister                                      !2┌R  А                  SYSCALLBACKUNREGISTER            	   iPOUIndex           ¤        !    POU Index of callback function.    Event            	   RTS_EVENT   ¤            Event to register       SysCallbackUnregister                                      !2┌R  А                         PLC_PRG           bAlarmFarbe             .               bVarToggeln             .            
   bVarTasten             .               bVarFalseTasten             .               dwCount            . 	              dwUpDown            .               bUpDown            .                                !2┌R  @                    
 ╕   .   /   ( !      K   *!     K   8!     K   F!     K   [!                 h!         +           К  К      AUX)K^╘╛ PWW▓           Ethernet_TCP_IP testProjekt.pro WAGOobergeschossNB WAGO Ethernet TCP/IP Treiber    A   щ  IP Adresse IP Addresse des Zielknotens 
   192.168.2.157 >   ъ  Portnummer Portnummer des Zielknotens    Ч	          V   ы  Transport Protokoll Benutztes Transport Protokoll               tcp    udp =   ш  Debug Stufe Immer 0, nur f№r internen Gebrauch      Й         Б      AUX)K^╘╛ PWW▓            Ethernet_TCP_IP test1.pro WAGOerdgeschoss WAGO Ethernet TCP/IP Treiber    A   щ  IP Adresse IP Addresse des Zielknotens 
   192.168.2.155 >   ъ  Portnummer Portnummer des Zielknotens    Ч	          V   ы  Transport Protokoll Benutztes Transport Protokoll               tcp    udp =   ш  Debug Stufe Immer 0, nur f№r internen Gebrauch        K         @   !2┌RWE        ════════                     CoDeSys 1-2.2   р     ════════                     ╙.  4       ы      
   Є         є         ў          °                    "          $                                                   '          (          ▒          │          ╡          ╣          ║         ╢          ╧          ╨          ╤         ╝          ╛          └          ┬          ─         ╞      А   ╩       P  ╚          ╠         ╬       А  ╥                    ~          А          С          Т          У          Ф          Х          Ц          Ч          Ш          Щ          Б          В          Г          Д          Е          Ж          З       @  И       @  К       @  Л       @  М       @  П       @  в         а         и          Ю       А  M         N          O          P          `         a          t          y          z          b         c          X          d         e         _          Q          \         R          K          U         X         Z         т          ф         ц      
   ш         ъ         ь         ю         ё         я          Ё          Є         є          Ї          ї          ў      (                                                                        "         !          #          $         Ы          ^          f         g          h          i          j          k         F          H         J         L          N         P         R          U         S          T          V          W          д          е          l          o          p          q          r          s         u          ▐          v         ж          з          |         ~         А         x          z      (   й          л         %         н          о          п         @         ▌          ф          ╪         &          Ё          	                   ц          ч          ш         щ          ъ         к          ▓          ┤          м          н          п          ░          ╖          ╕          ╛          ь          э                            I         J         K          	          L         M          Щ                             ▐          P         Q          S          )          	          	          Б           	          +	       @  ,	       @  -	                                                              ╙.  Є         є         ў          °                    "          $                                                   '          (          ▒          │          ╡          ╣          ║         ╢          ╧          ╨          ╤         ╝          ╛          └          ┬          ─         ╞      А   ╩       P  ╚          ╠         ╬       А  ╥          Ж         0И       ╨ К          П       @  в         и         a          t          y          z          b          c          X          d         e         _         \         R          K          U        UDPX         Z         т          ф         ц      
   ш         ъ         ь         ю         ё         я          Ё          Є         є          Ї          ї          ў      (   "          #         $          Ы          g          h          i         j          k         F          H         J         L          N         P         R          U         S          T          V          W          д          o          p          q          r          s          u          ▐          v         w         з         |         ~         А         x          z      (   й          %         н          о          п         @         ▌          р         с      X  ф          ╪         &        асЁ          	                   ц          ч          ш         щ          ъ         к          ▓          ┤          м          н          п          ░          ╖          ╕          ╛          ы          ь         э          ■                                                  I         J         K          	          L         M          Щ                             ▐          P         Q          S         )          	          	          Б           	          +	       @  ,	       @  -	                                                                                                                                                                      ════∙     ════════                                                   з  	   	   Name                     
   Index                            SubIndex                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Variable    	                 
   Value                Variable       Min                Variable       Max                Variable          5  
   	   Name                     
   Index                            SubIndex                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write    	   Type          ~         INT   UINT   DINT   UDINT   LINT   ULINT   SINT   USINT   BYTE   WORD   DWORD   REAL   LREAL   STRING    
   Value                Type       Default                Type       Min                Type       Max                Type          5  
   	   Name                     
   Index                            SubIndex                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write    	   Type          ~         INT   UINT   DINT   UDINT   LINT   ULINT   SINT   USINT   BYTE   WORD   DWORD   REAL   LREAL   STRING    
   Value                Type       Default                Type       Min                Type       Max                Type          d        Member    	                    Index-Offset                            SubIndex-Offset                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Min                Member       Max                Member          Я  	   	   Name                        Member    	                 
   Value                Member    
   Index                            SubIndex                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Min                Member       Max                Member          з  	   	   Name                     
   Index                            SubIndex                            Accesslevel          !         low   middle   high       Accessright          1      	   read only
   write only
   read-write       Variable    	                 
   Value                Variable       Min                Variable       Max                Variable                         Є     ════════               В   _Dummy@    @   @@    @   @             дя@             дя@@   @     Аv@@   ; @+   ё     ════════                                  Аv@      4@   ░             Аv@      D@   ░                       └       @                           Аf@      4@     Аf@                Аv@     Аf@     @u@     Аf@        ў┴ы             Module.Root-1__not_found__    Hardware configuration     IB          % QB          % MB          %   o     Module.K_Bus1Module.Root    K-Bus     IB          % QB          % MB          %    o     Module.FB_VARS2Module.Root    Fieldbus variables    IB          % QB          % MB          %    !2┌R	!2┌R     ════════           VAR_GLOBAL
END_VAR
                                                                                  "   , 2 2 √V              !2┌R                   start   Called when program starts    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     stop   Called when program stops    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     before_reset   Called before reset takes place    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     after_reset   Called after reset took place    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     shutdownC   Called before shutdown is performed (Firmware update over ethernet)    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     excpt_watchdog%   Software watchdog of IEC-task expired    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     excpt_fieldbus   Fieldbus error    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  	   ╙.     excpt_ioupdate
   KBus error    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  
   ╙.     excpt_dividebyzero*   Division by zero. Only integer operations!    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     excpt_noncontinuable   Exception handler    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     after_reading_inputs   Called after reading of inputs    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     before_writing_outputs    Called before writing of outputs    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.  
   debug_loop   Debug loop at breakpoint    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR     ╙.     online_change+   Is called after CodeInit() at Online-Change    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  !   ╙.     before_download$   Is called before the Download starts    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  "   ╙.     event_login/   Is called before the login service is performed    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  ї  ╙.     eth_overload   Ethernet Overload    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  ю  ╙.     eth_network_ready@   Is called directly after the Network and the PLC are initialised    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  я  ╙.  
   blink_codeN   New blink code / Blink code cleared ( Call STATUS_GET_LAST_ERROR for details )    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  Ё  ╙.     interrupt_0(   Interrupt Real Time Clock (every second)    _   FUNCTION systemevent: DWORD VAR_INPUT dwEvent: DWORD; dwFilter: DWORD; dwOwner: DWORD; END_VAR  ш  ╙.  $√     ════════               ════════           Standard `┐┬R	`┐┬R      ════════                         	!2┌R     ════════           VAR_CONFIG
END_VAR
                                                                                   '                ════════           Globale_Variablen !2┌R	!2┌R     ════════           VAR_GLOBAL
END_VAR
                                                                                               '           	     ════════           Variablen_Konfiguration !2┌R	!2┌R	     ════════           VAR_CONFIG
END_VAR
                                                                                                 П   |0|0 @Е    @c   Lucida Sans Typewriter @       HH':'mm':'ss @      dd'-'MM'-'yyyy   dd'-'MM'-'yyyy HH':'mm':'ssЇ   Р                               =              ╠3                 
    @ А          @      DEFAULT             System      П   |0|0 @Е    @c   Lucida Sans Typewriter @       HH':'mm':'ss @      dd'-'MM'-'yyyy   dd'-'MM'-'yyyy HH':'mm':'ssЇ   Р                      )   HH':'mm':'ss @                             dd'-'MM'-'yyyy @        '            .   , !   %8           PLC_PRG !2┌R	!2┌R      ════════          (* Testprogramm f№r WebVisu *)
PROGRAM PLC_PRG
VAR
	bAlarmFarbe		: BOOL	:= FALSE;
	bVarToggeln		: BOOL	:= FALSE;
	bVarTasten		: BOOL	:= FALSE;
	bVarFalseTasten	: BOOL	:= FALSE;

	dwCount			: DWORD	:= 0;

	dwUpDown		: DWORD	:= 0;
	bUpDown			: BOOL	:= TRUE;
END_VARё   dwCount := dwCount + 1;


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




                /   ,   U           PLC_VISU !2┌R
    @У-?6┌R'   d   "                                                                                                       
    @        
 
 y 3 A                                                            @                           Ї Р                              @                                                                                                          
    @        
 < y e A P                                                           @                          Ї Р                              @                                                                                                          
    @        
 n y Ч A В                                                           @                          Ї Р                              @                                                                                                          
    @        
 а y ╔ A ┤                                                           @                          Ї Р                              @                                                                                                           
    @        В 
 ё 3 ╣                                                           Links / Oben @                           Ї Р                              @                                                                                                           
    @        · 
 i3 1                                                          Zentr. / Zentr. @                          Ї Р                              @                                                                                                           
    @        r
 с3 й                                                          Rechts / Unten @                         
 Ї Р                              @                                                                                                           
    @        ъ
 Y3 !     А А                                          PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          Ї Р               PLC_PRG.bAlarmFarbe             @                                                                                                          
    @        В < ё e ╣ P                                                          Links / Oben @                           Ї Р                              @                                                                                                          
    @        · < ie 1P                                                          Zentr. / Zentr. @                      	    Ї Р                              @                                                                                                          
    @        r< сe йP                                                          Rechts / Unten @                      
   
 Ї Р                              @                                                                                                          
    @        ъ< Ye !P     А А                                          PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          Ї Р               PLC_PRG.bAlarmFarbe             @                                                                                                          
    @        В n ё Ч ╣ В                                                          Links / Oben @                           Ї Р                              @                                                                                                          
    @        · n iЧ 1В                                                          Zentr. / Zentr. @                          Ї Р                              @                                                                                                          
    @        rn сЧ йВ                                                          Rechts / Unten @                         
 Ї Р                              @                                                                                                          
    @        ъn YЧ !В     А А                                          PLC_PRG.bAlarmFarbe       Farbe
Alarmfarbe @                          Ї Р               PLC_PRG.bAlarmFarbe             @                                                                                                           
    @        
 ▄ y A Ё                                                          Var. toggeln @                          Ї Р           PLC_PRG.bVarToggeln                 @                                                                                                          
    @        
 y 7A "                                                         Var. toggeln @                          Ї Р           PLC_PRG.bVarToggeln                 @                                                                                                          
    @        
 @y iA T                                                         Var. toggeln @                          Ї Р           PLC_PRG.bVarToggeln                 @                                                                                                           
    @        В ▄ ё ╣ Ё                                                          Var. tasten @                          Ї Р               PLC_PRG.bVarTasten             @                                                                                                          
    @        В ё 7╣ "                                                         Var. tasten @                          Ї Р               PLC_PRG.bVarTasten             @                                                                                                          
    @        В @ё i╣ T                                                         Var. tasten @                          Ї Р               PLC_PRG.bVarTasten             @                                                                                                           
    @        · ▄ i1Ё                                                          Var. FALSE 
tasten @                          Ї Р               PLC_PRG.bVarFalseTasten            @                                                                                                          
    @        · i71"                                                         Var. FALSE 
tasten @                          Ї Р               PLC_PRG.bVarFalseTasten            @                                                                                                          
    @        · @ii1T                                                         Var. FALSE 
tasten @                          Ї Р               PLC_PRG.bVarFalseTasten            @                                                                                                           
    @        2 rQ СA Б                                                 PLC_PRG.bVarToggeln        @                          Ї Р                              @                                                                                                           
    @        к r╔ С╣ Б                                                 PLC_PRG.bVarTasten        @                          Ї Р                              @                                                                                                           
    @        "rAС1Б                                                 PLC_PRG.bVarFalseTasten        @                          Ї Р                              @                                                                                                           
    @        ъrYС!Б                                                         next @                           Ї Р                             @ 
   PLC_VISU_2                                                                                                      
    @        Рк ├й▀                                                           @                      "    Ї Р                              @                                                                                                           
    @        Ък ╣░ йн   А                                  PLC_PRG.dwUpDown / 50                    @                      #    Ї Р                              @                                                                                                           
    @        ък Y╬ !╝                                                      1 AND 1 OR 1   AND/OR 1==%s @                      $    Ї Р                              @                                                                                                           
    @        ъ▄ Y !ю                                                   %   PLC_PRG.dwCount + 5 - PLC_PRG.dwCount   ADD/SUB 5==%s @                      %    Ї Р                              @                                                                                                           
    @        ъ	Y-!                                                  %   PLC_PRG.dwCount / PLC_PRG.dwCount * 9   MUL/DIV 9==%s @                      &    Ї Р                              @                                     └└└     А   АА   А   АА   А А А ААА                  0   , , : r        
   PLC_VISU_2 !2┌R
    @>н╘Ь!2┌R   d   
                                                                                                     
    @            !YР,                             images\hintergrund.jpg                       Э               @                     Ї Р                                                                                                                                                
    @        ъrYС!Б                                                         prev @                          Ї Р                             @    PLC_VISU                                                                                                    
    @        
 
 y 3 A                               images\button40blue.jpg                       Э               @                     Ї Р                                                                                                                                              
    @        В 
 ё 3 ╣                        └└└    images\button40blue.jpg                       Э               @                     Ї Р       Arial                   Dies ist ein Test                                                                                                                  
    @        · 
 i3 1                              images\button40blue.jpg                       Э              @                     Ї Р           PLC_PRG.bVarToggeln               Var Toggeln                                                                                                                  
    @        r
 с3 й                              images\button40blue.jpg                       Э              @                 	    Ї Р               PLC_PRG.bVarTasten        
   Var Tasten                                                                                                                  
    @        ъ
 Y3 !                              images\button40blue.jpg                       Э             @                 
    Ї Р               PLC_PRG.bVarFalseTasten           Var FALSE Tasten                                                                                                                    
    @        "F Ae 1U                                                  PLC_PRG.bVarToggeln        @                          Ї Р                              @                                                                                                           
    @        ЪF ╣e йU                                                  PLC_PRG.bVarTasten        @                          Ї Р                              @                                                                                                           
    @        F 1e !U                                                  PLC_PRG.bVarFalseTasten        @                          Ї Р                              @                                     └└└     А   АА   А   АА   А А А ААА                  ¤     ════════         #   Standard.lib 26.3.10 13:18:49 @)жмK)   SYSLIBCALLBACK.LIB 26.3.10 13:18:49 @)жмK   !   ASCIIBYTE_TO_STRING @                  CONCAT @        	   CTD @        	   CTU @        
   CTUD @           DELETE @           F_TRIG @        
   FIND @           INSERT @        
   LEFT @        	   LEN @        	   MID @           R_TRIG @           REAL_STATE @          REPLACE @           RIGHT @           RS @        	   RTC @        
   SEMA @           SR @           STANDARD_VERSION @          STRING_COMPARE @          STRING_TO_ASCIIBYTE @       	   TOF @        	   TON @           TP @              Global Variables 0 @           b   SysCallbackRegister @   	   RTS_EVENT       RTS_EVENT_FILTER       RTS_EVENT_SOURCE                   SysCallbackUnregister @              Globale_Variablen @           Version @                          ════════           2 є  є                             
             ·     ════════        °     ════════                   	   Bausteine                PLC_PRG  .                 
   Datentypen                    Visualisierungen                PLC_VISU  /                
   PLC_VISU_2  0                      Globale Variablen                 Globale_Variablen                     Variablen_Konfiguration  	                                                ════════             b┐┬R╙.             ╙.                	   localhost            P      	   localhost            P      	   localhost            P     ?6┌R  ├╛В