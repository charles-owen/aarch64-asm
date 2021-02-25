
export const PrettyPrint = function(assembler) {
    
    this.output = '';
    
    this.add = (lineNum, line, address, bytes) => {

        let ln = '' + lineNum;
        while(ln.length < 4) {
            ln = ' ' + ln;
        }

        let ad = address.toString(16);
        if(bytes.length > 0) {
            while(ad.length < 4) {
                ad = '0' + ad;
            }
        } else {
            ad = '    ';
        }


        this.output += ln + ' ' + ad.toUpperCase() + ' ';

        let byteCnt = 0;
        for( ; byteCnt < bytes.length && byteCnt < 4;  byteCnt++) {
            this.output += toHex2(bytes[byteCnt]);
        }

        for(let i=byteCnt; i<4; i++) {
            this.output += '  ';
        }

        this.output += '  ' + line + "\n";

    }

    const toHex2 = (value) => {
        let hx = value.toString(16);
        if(hx.length < 2) {
            hx = '0' + hx;
        }

        return hx.toUpperCase();
    }

    
    const init = ()=> {
    }
    
    init();
}