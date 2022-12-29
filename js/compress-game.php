<?php

    header("Content-type: text/javascript");

    function compress($buffer) {

        $buffer = preg_replace("/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/", "", $buffer);
        $buffer = str_replace(array("\r\n", "\r", "\n", "\t", "  ", "    ", "    "), "", $buffer);

        return $buffer;

    }

    ob_start("compress");

    include("base/log.js");
    include("base/options.js");
    include("base/tools.js");
    include("base/network.js");
    include("base/gameitem.js");
    include("base/imageitem.js");
    include("base/animateditem.js");
    include("base/window.js");
    include("base/imagebutton.js");
    include("base/textitem.js");
    include("base/valuebutton.js");
    include("base/soundplayer.js");
    include("controls/menubutton.js");
    include("controls/maxbetbutton.js");
    include("controls/linesbutton.js");
    include("controls/totalbetbutton.js");
    include("controls/autoplaybutton.js");
    include("controls/startbutton.js");
    include("controls/infobox.js");
    include("controls/controlbox.js");
    include("help/helpbox.js");
    include("help/helppage1.js");
    include("help/helppage2.js");
    include("help/helppage3.js");
    include("jackpots/jackpot.js");
    include("jackpots/jackpot1.js");
    include("jackpots/jackpot2.js");
    include("reels/reel.js");
    include("reels/reelbox.js");
    include("lines/winsymbol.js");
    include("lines/winbox.js");
    include("lines/scatterline.js");
    include("lines/line.js");
    include("lines/linebox.js");
    include("windows/lineswindow.js");
    include("windows/betwindow.js");
    include("windows/dialog.js");
    include("menu/menuitem.js");
    include("menu/menuwindow.js");
    include("risk/riskcard.js");
    include("risk/riskbox.js");
    include("bonus/textbanner.js");
    include("background.js");
    include("game.js");

    ob_end_flush();

?>
