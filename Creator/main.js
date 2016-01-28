var n, m, i, j, count, max, maze = [],
    Flag = 0;
//BUILD THE GRID
function create_block() {
    n = $("#nrow").val();
    m = $("#ncol").val();
    max = n * m;
    var flag = 0;
    var frame = $(".mazeFrame");
    frame.html('');
    $(".screen").html('');
    frame.append('<table class = "table" style = "opacity : 0"></table>').mouseleave(function () {
        Flag = 0;
    }).mousedown(function () {
        Flag = 1;
    }).mouseup(function () {
        Flag = 0;
    });
    count = 0;
    for (i = 1; i <= n; i++) {
        $(".table").append('<tr class = "table_row" id = "row_' + i + '"></tr>');
        for (j = 1; j <= m; j++) {
            count++;
            $('#row_' + i + '').append('<td class = "block" id = "' + (count) + '"></td>');
        }
    }
    TweenMax.fromTo($(".table"), 2, {
        scale: 0.5,
        opacity: 0.8
    }, {
        ease: Elastic.easeOut,
        opacity: 1,
        scale: 1
    });
    if (n && m) {
        $(".generate").addClass("button").removeClass("button_inactive");
    }

    //Drag mouse
    $(".block").mousedown(function () {
        Flag = 1;
        var This = $(this),
            Index = This.index(),
            ParentID = This.parent().attr('id');
        if ((ParentID !== 'row_1') && (ParentID !== 'row_' + n) && (Index % m != 0) && (Index % m != m - 1))
            TweenMax.fromTo(This, 0.7, {
                scale: 0.7,
            }, {
                ease: Back.easeOut,
                scale: 1
            }, switch_block(This));
    }).mouseup(function () {
        Flag = 0;
    }).mouseenter(function () {
        if (Flag) {
            var This = $(this),
                Index = This.index(),
                ParentID = This.parent().attr('id');
            if ((ParentID !== 'row_1') && (ParentID !== 'row_' + n) && (Index % m != 0) && (Index % m != m - 1))
                switch_block(This);
        }
    });
}

function switch_block(o) {
    o.toggleClass("blockOff");
}


$(document).ready(function () {
    //generate the 2-D maze array
    $(".gen_maze").click(function () {
        create_block();
    });
    $(".generate").click(function () {
        count = 1;
        var temp;
        for (i = 0; i < n; i++) {
            maze[i] = [];
            for (j = 0; j < m; j++) {
                temp = $('#' + count + '');
                if (temp.css("background-color") == "rgb(255, 255, 255)")
                    maze[i][j] = 1;
                else
                    maze[i][j] = 0;
                count++;
            }
        }
        $(".display").removeClass("button_inactive").addClass("button");
    });

    //printing 2-D maze array
    $(".display").click(function () {
        count = 1;
        var temp = $(".screen").html('');
        for (i = 0; i < n; i++) {
            temp.append('[');
            for (j = 0; j < m; j++) {
                temp.append('' + maze[i][j] + '');
                if (j < m - 1) temp.append(',');
                count++;
            }
            temp.append('],<br>');
        }
        TweenMax.fromTo(temp, 0.7, {
            scale: 0.8,
            opacity: 0.5
        }, {
            ease: Back.easeOut,
            scale: 1,
            opacity: 1
        });
    });
});
