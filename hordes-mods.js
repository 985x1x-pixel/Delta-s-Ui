(async () => {
    'use strict';

    document.open();
    document.write('<!DOCTYPE html><html><head></head><body></body></html>');
    document.close();

    const GITHUB_BASE = 'https://raw.githubusercontent.com/Shturmovicc/hordes-legendary-items/main/items';

    try {
        let html = await fetch('https://hordes.io/play').then(d => d.text());
        const element = html.match(/<script.*?client\.js.*?><\/script>/)[0];
        const url = element.match(/src="(.*?)"/)[1];
        let client = await fetch(url).then(d => d.text());

        // ============================================
        // CUSTOM RARITIES MODIFICATIONS
        // ============================================

        client = client.replace(
            /Ci=(\w+)=>(\w+)>=90\?3:(\w+)>=70\?2:(\w+)>=50\?1:0/,
            'Ci=$1=>$1>=109?5:$1>=99?4:$1>=90?3:$1>=70?2:$1>=50?1:0'
        );

        client = client.replace(
            /LE=\[\["white","common","grey"\],\["green","uncommon","green-l"\],\["blue","rare","blue-l"\],\["purp","epic","purp-l"\]\]/,
            'LE=[["white","common","grey"],["green","uncommon","green-l"],["blue","rare","blue-l"],["purp","epic","purp-l"],["orange","legendary","orange-l"],["red","mythical","red-l"]]'
        );

        client = client.replace(
            /sr=\((\w+),(\w+),(\w+),(\w+)\)=>`\/data\/items\/\$\{(\w+)\}\/\$\{(\w+)=="book"\?q1\((\w+),(\w+)\):(\w+)\+(\w+)\}_q\$\{(\w+)\}\.\$\{(\w+)\}\?v=\d+`/,
            `sr=($1,$2,$3,$4)=>{
                const filename = $1=="book"?q1($2,$3):$1+$2;
                if($4 >= 4) {
                    return "${GITHUB_BASE}/"+$1+"/"+filename+"_q"+$4+".webp";
                }
                return \`/data/items/\${$1}/\${filename}_q\${$4}.\${$12}?v=8829640\`;
            }`
        );

        client = client.replace(
            '_.replace(".","_grey.").replace(/_q[0-9]/g,"")',
            '(_.includes("githubusercontent")?_.replace(/_q[0-9]/,"_grey"):_.replace(".","_grey.").replace(/_q[0-9]/g,""))'
        );

        client = client.replace(
            'n(13,r=f?Nt(f.quality)[0]+(s?" grey":""):"grey")',
            'n(13,r=f?(f.type==="charm"?"charm"+f.tier:Nt(f.quality)[0])+(s?" grey":""):"grey")'
        );

        client = client.replace(
            '"slottitle text"+Nt(t[0].quality)[0]+" svelte-h3wg5"',
            '"slottitle text"+(t[0].type==="charm"?"charm"+t[0].tier:Nt(t[0].quality)[0])+" svelte-h3wg5"'
        );

        client = client.replace(
            '"slottitle text"+Nt(ce[0].quality)[0]+" svelte-h3wg5"',
            '"slottitle text"+(ce[0].type==="charm"?"charm"+ce[0].tier:Nt(ce[0].quality)[0])+" svelte-h3wg5"'
        );

        client = client.replace(
            '(t[0].stacks?"":Nt(t[0].quality)[1])+""',
            '(t[0].stacks?"":(t[0].type==="charm"?"charm":Nt(t[0].quality)[1]))+""'
        );

        // ============================================
        // REMOVE OVERLAY IMAGES MODIFICATIONS
        // ============================================

        // Disable the fu function that appends cooldown overlay images
        client = client.replace(
            /,fu=\(t,e,n\)=>\{sw&&e&&t!==e\.step&&\(e\.cdimg!==void 0&&\(cu\.get\(n\)\[e\.step\]\.push\(e\.removeChild\(e\.cdimg\)\),e\.cdimg=void 0\),\(e\.step=t\)>0&&\(cu\.get\(n\)\[e\.step\]\.length===1\?e\.cdimg=cu\.get\(n\)\[e\.step\]\[0\]\.cloneNode\(\):e\.cdimg=cu\.get\(n\)\[e\.step\]\.pop\(\),e\.appendChild\(e\.cdimg\)\)\)\}/,
            ',fu=(t,e,n)=>{}'
        );

        // Disable sw (cooldown overlay system) initialization
        client = client.replace(
            /,sw=!1,YE=\(\)=>\{fetch\("\/data\/ui\/circlecooldowns\/cir/,
            ',sw=!1,YE=()=>{return;fetch("/data/ui/circlecooldowns/cir'
        );

        // ============================================
        // HEART EMOJI MODIFICATIONS
        // ============================================

        client = client.replace(
            /Z_\(!0\),z9\(\)\};/,
            `Z_(!0),z9();window.gameI=I;window.gameZn=()=>zn;window.playerEmojis={};window.emojiHolders={heart:null,crown:null,skull:null,sword:null,gem:null}};`
        );

        client = client.replace(
            /mB=\(t,e\)=>\{let n=t\.visual&&t\.visual\.cDist;if\(n>fe\.nameplateViewRange\)return;n\?n\/=70:n=0;/,
            `mB=(t,e)=>{let n=t.visual&&t.visual.cDist;if(n>fe.nameplateViewRange)return;n?n/=70:n=0;if(window.playerEmojis&&t.name&&window.playerEmojis[t.name]&&t.hudPos){var emojiType=window.playerEmojis[t.name];var emojiData={heart:{char:"\\u2764",color:"#ff4444"},crown:{char:"\\uD83D\\uDC51",color:"#ffd700"},skull:{char:"\\uD83D\\uDC80",color:"#ffffff"},sword:{char:"\\u2694",color:"#ff4444"},gem:{char:"\\uD83D\\uDC8E",color:"#44ff44"}};var ed=emojiData[emojiType];if(ed){Eo.save();Eo.globalAlpha=1;var baseSize=52;var scale=Math.max(0.7,t.namePlateScale||1);Eo.font="bold "+Math.floor(baseSize*scale)+"px Arial";Eo.textAlign="center";Eo.textBaseline="middle";Eo.shadowColor="rgba(0,0,0,0.9)";Eo.shadowBlur=8;Eo.fillStyle=ed.color;Eo.fillText(ed.char,t.hudPos[0],t.hudPos[1]-40*scale);Eo.restore()}}`
        );

        // ============================================
        // CSS INJECTION
        // ============================================

        const customCSS = `<style>
            /* Custom Rarities CSS */
            .border.orange{border:3px solid #fd8b00}
            .textorange{color:#fd8b00}
            .textorange-l{color:#ffaa33}
            .slottitle.textorange{color:#fd8b00}
            .pack .textorange{color:#fd8b00}
            .orange-l{color:#ffaa33}
            .slot.border.orange:hover{border:3px solid #ff9933}
            .border.red{border:3px solid #ff2222}
            .textred{color:#ff2222}
            .textred-l{color:#ff6666}
            .slottitle.textred{color:#ff2222}
            .pack .textred{color:#ff2222}
            .red-l{color:#ff6666}
            .slot.border.red:hover{border:3px solid #ff6666}
            .border.charm0{border:3px solid #aedbf8}
            .textcharm0{color:#aedbf8}
            .slot.border.charm0:hover{border:3px solid #d0efff}
            .border.charm1{border:3px solid #abe7e5}
            .textcharm1{color:#abe7e5}
            .slot.border.charm1:hover{border:3px solid #cffffe}
            .border.charm2{border:3px solid #df5826}
            .textcharm2{color:#df5826}
            .slot.border.charm2:hover{border:3px solid #ff7846}
            .border.charm3{border:3px solid #6b1ec4}
            .textcharm3{color:#6b1ec4}
            .slot.border.charm3:hover{border:3px solid #9040f0}
            .border.charm4{border:3px solid #8b5cf6}
            .textcharm4{color:#8b5cf6}
            .slot.border.charm4:hover{border:3px solid #a880ff}
            .border.charm5{border:3px solid #dc2626}
            .textcharm5{color:#dc2626}
            .slot.border.charm5:hover{border:3px solid #ff4646}
            .border.charm6{border:3px solid #b6a904}
            .textcharm6{color:#b6a904}
            .slot.border.charm6:hover{border:3px solid #dcd020}
            .border.charm7{border:3px solid #7f1d1d}
            .textcharm7{color:#7f1d1d}
            .slot.border.charm7:hover{border:3px solid #a03030}
            .border.charm8{border:3px solid #fff}
            .textcharm8{color:#fff}
            .slot.border.charm8:hover{border:3px solid #fff;box-shadow:0 0 10px #fff}
            .border.charm9{border:3px solid #00fc84}
            .textcharm9{color:#00fc84}
            .slot.border.charm9:hover{border:3px solid #40ffa0}
            .border.charm10{border:3px solid #b63a64}
            .textcharm10{color:#b63a64}
            .slot.border.charm10:hover{border:3px solid #d05080}
            .border.charm11{border:3px solid #40edff}
            .textcharm11{color:#40edff}
            .slot.border.charm11:hover{border:3px solid #80ffff}
            .border.charm12{border:3px solid #8B4513}
            .textcharm12{color:#8B4513}
            .slot.border.charm12:hover{border:3px solid #a86520}
            .border.charm13{border:3px solid #78350f}
            .textcharm13{color:#78350f}
            .slot.border.charm13:hover{border:3px solid #a05020}
            .border.charm14{border:3px solid #ffdb6b}
            .textcharm14{color:#ffdb6b}
            .slot.border.charm14:hover{border:3px solid #ffeb90}
        </style>`;

        // ============================================
        // KEYBOARD SCRIPT FOR EMOJIS
        // ============================================

        const keyboardScript = `
        <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                var keyToEmoji = {
                    'l': 'heart',
                    't': 'crown',
                    'y': 'skull',
                    'u': 'sword',
                    'o': 'gem'
                };

                function assignEmoji(playerName, emojiType) {
                    var currentEmoji = window.playerEmojis[playerName];

                    if(currentEmoji === emojiType) {
                        delete window.playerEmojis[playerName];
                        window.emojiHolders[emojiType] = null;
                        return;
                    }

                    if(currentEmoji) {
                        window.emojiHolders[currentEmoji] = null;
                    }

                    var oldHolder = window.emojiHolders[emojiType];
                    if(oldHolder && oldHolder !== playerName) {
                        delete window.playerEmojis[oldHolder];
                    }

                    window.playerEmojis[playerName] = emojiType;
                    window.emojiHolders[emojiType] = playerName;
                }

                document.addEventListener("keydown", function(e) {
                    var key = e.key.toLowerCase();
                    if(keyToEmoji[key] && !e.ctrlKey && !e.altKey) {
                        var ae = document.activeElement;
                        if(ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;

                        var zn = window.gameZn ? window.gameZn() : 0;
                        if(zn > 0 && window.gameI && window.gameI.entities && window.gameI.entities.map) {
                            var entity = window.gameI.entities.map.get(zn);
                            if(entity && entity.name) {
                                assignEmoji(entity.name, keyToEmoji[key]);
                                e.preventDefault();
                            }
                        }
                    }
                }, true);
            }, 2000);
        });
        </script>`;

        // ============================================
        // APPLY ALL MODIFICATIONS TO HTML
        // ============================================

        window.customClient = client;
        html = html.replace(element, `<script>let _script=customClient;delete customClient;eval(_script)</script>`);
        html = html.replace('</head>', customCSS + '</head>');
        html = html.replace('</body>', keyboardScript + '</body>');

        document.open();
        document.write(html);
        document.close();

    } catch (e) {
        console.error('Combined mods error:', e);
        location.reload();
    }
})();
