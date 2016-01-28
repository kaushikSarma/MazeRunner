/*
    Author : Divya Mamgai
    Name : MazeRunner.js
*/
(function (w, d, wO, dO, $) {
    var DisplayTableObject,
        OverlayTableObject,
        WaysObject,
        ComputeButtonObject,
        SelfButtonObject,
        Maze,
        ProcessingMaze,
        Moves,
        Rows,
        Columns,
        X,
        Y,
        StartX,
        StartY,
        EndX,
        EndY,
        SelfForce = false,
        SelfPreviousX,
        SelfPreviousY;

    /**
     * @return {boolean}
     */
    function Move(MoveToPerform, Force) {
        var dx = 0,
            dy = 0;
        switch (MoveToPerform) {
            case 0:
                dy = -1;
                break;
            case 1:
                dx = 1;
                break;
            case 2:
                dy = 1;
                break;
            case 3:
                dx = -1;
                break;
        }
        X += dx;
        Y += dy;
        if (Force) {
            ProcessingMaze[Y][X] = 2;
            return true;
        } else {
            if ((X < 0 || X >= Columns) || (Y < 0 || Y >= Rows)) {
                X -= dx;
                Y -= dy;
                return false;
            }
            if (ProcessingMaze[Y][X] === 1 || ProcessingMaze[Y][X] === 2) {
                X -= dx;
                Y -= dy;
                return false;
            } else {
                ProcessingMaze[Y][X] = 2;
                return true;
            }
        }
    }

    function ResetProcessingMaze() {
        var i = 0,
            j;
        ProcessingMaze = [];
        for (; i < Rows; i++) {
            ProcessingMaze.push([]);
            j = 0;
            for (; j < Columns; j++) ProcessingMaze[i].push(Maze[i][j]);
        }
    }

    /**
     * @return {number}
     */
    function ReverseMove(MoveToPerform) {
        return (MoveToPerform + 2) % 4;
    }

    function AnimatePath(X, Y, Move, Callback, Mark) {
        TweenMax.fromTo($('#Row-' + Y + ' #Column-' + X, OverlayTableObject), 0.1, {
            opacity: 1,
            top: 32 * (Move === 0 ? 1 : (Move === 2 ? -1 : 0)),
            left: 32 * (Move === 1 ? -1 : (Move === 3 ? 1 : 0))
        }, {
            top: 0,
            left: 0,
            ease: Linear.easeNone,
            onComplete: function () {
                if (Mark) {
                    TweenMax.to(this.target, 1, {
                        delay: 0.5,
                        scale: 0.5,
                        ease: Elastic.easeOut
                    });
                }
                if (Callback !== undefined) Callback();
            }
        });
    }

    function PerformAnimation(Way, Length, Index) {
        if (Index < Length) {
            Move(Way[Index], false);
            AnimatePath(X, Y, Way[Index++], function () {
                PerformAnimation(Way, Length, Index);
            }, true);
        }
    }

    function Compute() {
        var k = 0,
            Offset,
            Start,
            End,
            i,
            j,
            ReversePreviousMove = -1,
            PreviousMove;
        WaysObject.html('');
        Moves = [[], [], [], [], [], [], [], []];
        for (; k < 8; k++) {
            $('<a class="Button" href="#Display" id="' + k + '">Perform Way - ' + (k + 1) + '</a>').appendTo(WaysObject).on('click', function () {
                var Way = Moves[parseInt($(this).attr('id'))],
                    Length = Way.length,
                    i = 0;
                wO.unbind();
                X = StartX;
                Y = StartY;
                ResetProcessingMaze();
                Display(OverlayTableObject);
                ProcessingMaze[Y][X] = 2;
                AnimatePath(X, Y, 1, function () {
                    PerformAnimation(Way, Length, i);
                }, true);
            });
            ResetProcessingMaze();
            Offset = k < 4 ? 1 : -1;
            Start = k % 4;
            End = Start - Offset;
            X = StartX;
            Y = StartY;
            ProcessingMaze[Y][X] = 2;
            i = Start;
            j = 0;
            while (X != EndX || Y != EndY) {
                if (ReversePreviousMove != i) {
                    if (Move(i, false)) {
                        Moves[k].push(i);
                        PreviousMove = i;
                        ReversePreviousMove = ReverseMove(PreviousMove);
                        i = End;
                        j = 0;
                    } else {
                        if (j >= 4) {
                            ProcessingMaze[Y][X] = 1;
                            if (Moves[k].length > 0) Moves[k].pop();
                            else {
                                console.log('Trapped forever!');
                                return;
                            }
                            Move(ReversePreviousMove, true);
                            PreviousMove = Moves[k][Moves[k].length - 1];
                            ReversePreviousMove = ReverseMove(PreviousMove);
                            i = End;
                            j = 0;
                        } else j++;
                    }
                }
                i += Offset;
                if (Offset > 0) i = i > 3 ? 0 : i;
                else i = i < 0 ? 3 : i;
            }
            $('#' + (k), WaysObject).append(' [' + Moves[k].length + ']');
        }
    }

    function Display(TableObject) {
        var i = 0,
            j,
            RowObject;
        TableObject.html('');
        for (; i < Rows; i++) {
            j = 0;
            RowObject = $('<tr id="Row-' + i + '"></tr>').appendTo(TableObject);
            for (; j < Columns; j++) {
                switch (Maze[i][j]) {
                    case 0:
                        RowObject.append('<td id="Column-' + j + '" class="Way"></td>');
                        break;
                    case 1:
                        RowObject.append('<td id="Column-' + j + '" class="Wall"></td>');
                        break;
                    case 2:
                        RowObject.append('<td id="Column-' + j + '" class="Path"></td>');
                        break;
                }
            }
        }
    }

    function GetMaze(Callback) {
        $.ajax({
            dataType: 'json',
            url: 'maze.json',
            complete: function (response) {
                var JSONObject = JSON.parse(response.responseText);
                Maze = JSONObject.Maze;
                Rows = Maze.length;
                Columns = Maze[0].length;
                StartX = JSONObject.Start.X;
                StartY = JSONObject.Start.Y;
                EndX = JSONObject.End.X;
                EndY = JSONObject.End.Y;
                Callback();
            }
        });
    }

    function CannotMoveAnimation() {
        TweenMax.fromTo($('#Row-' + Y + ' #Column-' + X, OverlayTableObject), 0.1, {
            backgroundColor: '#ff4545'
        }, {
            backgroundColor: '#ffff66',
            ease: Linear.easeNone,
            onComplete: function () {
                TweenMax.to(this.target, 0.25, {
                    backgroundColor: '#ff4545',
                    ease: Linear.easeNone
                });
            }
        });
    }

    function StartSelf() {
        ResetProcessingMaze();
        X = StartX;
        Y = StartY;
        SelfPreviousX = StartX;
        SelfPreviousY = StartY;
        ProcessingMaze[Y][X] = 2;
        Display(OverlayTableObject);
        AnimatePath(X, Y, 1);
        wO.unbind().on('keypress', function (e) {
            var _Move = undefined;
            switch (e.which) {
                case 119:
                    _Move = 0;
                    break;
                case 100:
                    _Move = 1;
                    break;
                case 115:
                    _Move = 2;
                    break;
                case 97:
                    _Move = 3;
                    break;
            }
            if (_Move !== undefined) {
                SelfPreviousX = X;
                SelfPreviousY = Y;
                if (Move(_Move, false)) {
                    if (X === EndX && Y === EndY) {
                        AnimatePath(X, Y, _Move, function () {
                            wO.unbind();
                            TweenMax.to($('#Row-' + Y + ' #Column-' + X, OverlayTableObject), 0.25, {
                                backgroundColor: '#45ff45',
                                ease: Linear.easeNone
                            });
                        });
                    } else {
                        AnimatePath(X, Y, _Move);
                    }
                } else CannotMoveAnimation();
            }
        }).on('keydown', function (e) {
            if (e.which === 77)
                SelfForce = true;
        }).on('keyup', function (e) {
            if (e.which === 77)
                SelfForce = false;
        });
    }

    dO.on('ready', function () {
        DisplayTableObject = $('#Display tbody', d);
        OverlayTableObject = $('#Overlay tbody', d);
        WaysObject = $('#Ways', d);
        ComputeButtonObject = $('#ComputeButton', d).on('click', function () {
            Compute();
        });
        SelfButtonObject = $('#SelfButton', d).on('click', function () {
            StartSelf();
        });
        GetMaze(function () {
            Display(DisplayTableObject);
        });
    });
})(window, document, jQuery(window), jQuery(document), jQuery);
