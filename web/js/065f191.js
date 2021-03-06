$(document).ready(function () {

    var t = window.location.pathname.split('/');

    $('#loginmenu').find('form').click(function (e) {
        e.stopPropagation();
    });

    /*$('#updateUser').submit(function (e) {
        e.preventDefault();

        var data = {
            id: $('').data('id'),
            email: $('#email').val(),
            position: $('#gobalposition').val(),
            oldPassword: $('#oldPassword').val(),
            newPassword: $('#newPassword').val(),
            repeatPassword: $('#repeatPassword').val()
        };

        $.post('saveuser', data, function (ret) {
            if (ret == 'OK') {
                //
            }
        });

        return false;
    });*/

    switch (t[t.length - 1]) {
        case 'addgame':
            $(".select2").select2({
                placeholder: "Sélectionner un joueur",
                formatResult: formatResult,
                formatSelection: formatResult,
                dropdownCssClass: "bigdrop",
                minimumResultsForSearch: -1
            });

            $('#score2, #score1').select2({ minimumResultsForSearch: -1});
            $(".select2-search, .select2-focusser").remove();

            $('.isWinner').click(function (e) {
                e.preventDefault();

                $('#score' + $(this).data('team') + '').select2('val', '10');

                return false;
            });

            $('#form-addgame').submit(function (e) {
                e.preventDefault();
                var $err = $('#form-addgame-error');

                var error = "";

                if ($('#score2').val() === $('#score1').val()) {
                    error = 'Erreur : Les deux scores ne peuvent pas être égaux.';
                }

                if ($('#player1Team1').val() === $('#player2Team1').val() || $('#player1Team2').val() === $('#player2Team2').val()) {
                    error = 'Erreur : Même joueur présent dans la même équipe';
                }

                if ($('#player1Team1').val() === $('#player1Team2').val() || $('#player1Team1').val() === $('#player2Team2').val() || $('#player2Team1').val() === $('#player1Team2').val() || $('#player2Team1').val() === $('#player2Team2').val()) {
                    error = 'Erreur : Même joueur présent dans deux équipes';
                }

                if ($('#datepartie').val().trim() === '') {
                    error = "Erreur : Veuillez spécifier une date";
                }

                if (error !== "") {
                    $err.text(error).removeClass('hidden');
                } else {
                    var data = {
                        date: $('#datepartie').val(),
                        joueur1equipe1: $('#player1Team1').val(),
                        joueur2equipe1: $('#player2Team1').val(),
                        joueur1equipe2: $('#player1Team2').val(),
                        joueur2equipe2: $('#player2Team2').val(),
                        score1: $('#score1').val(),
                        score2: $('#score2').val()
                    };
                    $.post('savegame', data, function (ret) {
                        if (ret === 'ok') {
                            $err.removeClass('text-danger').addClass('text-success');
                            $err.text('Partie enregistrée !')
                            $err.removeClass('hidden');
                            setTimeout(function () {
                                $err.addClass('hidden');
                            }, 1000);
                        } else {
                            $err.text('Erreur : La partie n\'a pas été enregistrée').removeClass("hidden");
                            setTimeout(function () {
                                $err.addClass('hidden');
                            }, 2000);
                        }
                    });
                }
                return false;
            });

            $('#datepartie').pickadate({format: 'dd-mm-yyyy', formatSubmit: 'dd-mm-yyyy'});
            break;
        case 'game':
            $('#gamedate').pickadate({format: 'dd-mm-yyyy', formatSubmit: 'dd-mm-yyyy'});

            $('input[name=reset]').click(function (e) {
                e.preventDefault();
                $('#gamedate').val('');
                $('input[name="joueur"]').val('');
                $('input[name="submit"]').click();
                return false;
            });

            $('#game-table').on('click', '.del-game-confirm',function () {
                var tr = $(this).parent().parent().parent();
                $.post('admin/delgame', {id: $(this).data('id')}, function () {
                    tr.remove();
                });
            }).on('click', '.del-game-cancel',function () {
                $(this).parent().parent().html('<button class="btn btn-danger btn-xs del-game" data-id="' + $(this).prev().data('id') + '"><span class="glyphicon glyphicon-remove"></span></button>');
            }).on('click', '.del-game', function () {
                var html = '<div class="btn-group"><button type="button" class="btn btn-success btn-xs del-game-confirm" data-id="' + $(this).data('id') + '"><span class="glyphicon glyphicon-ok"></span></button><button type="button" class="btn btn-danger btn-xs del-game-cancel"><span class="glyphicon glyphicon-remove"></span></button></div>';
                $(this).parent().html(html);
            });
            break;
        case 'player':
            $('.player, .period-selector, .aggregate-data').click(function () {

                if ($(this).hasClass('period-selector')) {
                    $('.period-selector.active').removeClass('active');
                    $(this).addClass('active');
                } else if ($(this).hasClass('aggregate-data')) {
                    $('.aggregate-data.active').removeClass('active');
                    $(this).addClass('active');
                } else {
                    $('.player.active').removeClass('active');
                    $(this).addClass('active');
                }

                var data = {
                    playerId: $('.player.active').data('id'),
                    date: $('.period-selector.active > a').data('value'),
                    aggregate: $('.aggregate-data.active > a').data('value')
                };

                $.post('morestat', data, function (pdata) {

                    if (typeof pdata.stats.nbGames !== 'undefined') {
                        for (var i in pdata.stats) {
                            if (pdata.stats[i] === null) {
                                $('#stat-' + i).text('N/A');
                            } else {
                                $('#stat-' + i).text(pdata.stats[i]);
                            }
                        }
                        $('#playerstatstable, #playerstatperiod, #playerstattitle, #chartContainer').removeClass('hidden');
                        $('#playerstatnotice').addClass('hidden');
                        $('#playername').text($('.player.active').text());
                    }

                    doTheChart(pdata);
                }, 'json');

                $('html, body').animate({
                    scrollTop: $('#morestat').offset().top - 45 // -45 because of bootstrap navbar
                }, 'slow');
                return false;
            });
            break;
        case 'compare' :
            $(".select2").select2({
                placeholder: "Sélectionner un joueur",
                formatResult: formatResult,
                formatSelection: formatResult,
                dropdownCssClass: "bigdrop",
                minimumResultsForSearch: -1
            });

            $('#go-compare').click(function(){
                $.post('gocompare', {player1: $('#player1').val(), player2: $('#player2').val()}, function(pdata){
                    for (var p in pdata) {
                        for (var i in pdata[p]) {
                            var val = pdata[p][i];
                            var pclass = 'progress-bar-success';
                            var p2 = 'player2';

                            if(p == 'player2') {
                                p2 = 'player1';
                            }

                            if(val < pdata[p2][i]) {
                                pclass = 'progress-bar-danger';
                            } else if (val == pdata[p2][i]) {
                                pclass = 'progress-bar-info';
                            }

                            $('.'+p+'data .badge[data-action="'+i+'"]').text(val)
                                .next().children().attr('style','width:'+(val*100)+'%')
                                        .attr('aria-valuenow', val).text(val)
                                        .removeClass('progress-bar-info progress-bar-danger progress-bar-success').addClass(pclass);
                        }
                    }
                });
            });
        case 'playerstat' :
            $('.graphme').click(function () {
                $.post('playerstatgraph', {action: $(this).data('action')}, function (ret) {
                    $('#customchart').highcharts({
                        chart: {type: 'line'},
                        credits: {enabled: false},
                        title: {text: 'Nombre de parties jouées par jours'},
                        xAxis: {categories: ret.date},
                        yAxis: {
                            min: 0,
                            title: {text: 'Parties jouées'}
                        },
                        series: [
                            {
                                name: 'Nombre de parties',
                                data: ret.data
                            }
                        ]
                    });
                }, 'json');
            });
            break;
        case 'matchmaker' :
            $('.clickme-player').click(function () {
                $(this).toggleClass('active');
            });

            $('.buttonmaker').click(function () {
                var players = [];
                $('.clickme-player.active').each(function () {
                    players.push($(this).data('id'));
                });
                if (players.length < 4) {
                    var $err = $('#error-matchmaking');
                    $err.removeClass('hidden');
                    setTimeout(function () {
                        $err.addClass('hidden');
                    }, 3000);
                } else {
                    $.post('matchmaking', {ids: players}, function (pdata) {
                        var teams = $('#teamsContainer');
                        teams.empty();
                        for (p in pdata) {
                            var cl = p % 2 === 0 ? 'success' : 'info';
                            teams.append('<div class="col-xs-5 col-sm-5 col-md-5 col-lg-5">' +
                                '<ul class="list-group">' +
                                '<li class="list-group-item list-group-item-' + cl + '">' + pdata[p][0] + '</li>' +
                                '</ul>' +
                                '</div>' +
                                '<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2" style="text-align:center">' +
                                'ET' +
                                '</div>' +
                                '<div class="col-xs-5 col-sm-5 col-md-5 col-lg-5">' +
                                '<ul class="list-group">' +
                                '<li class="list-group-item list-group-item-' + cl + '">' + pdata[p][1] + '</li>' +
                                '</ul>' +
                                '</div>');
                        }
                    });
                }
            });
            break;
        case 'schedule':
            var toggleButtons = function ($this) {
                var $listGroup = $this.parent().prev();
                if ($listGroup.children('.list-group-item').length === 4) {
                    $this.parent().children('button').addClass('hidden');
                    $this.parent().children('i').removeClass('hidden');
                } else {
                    if ($this.hasClass('btn-danger')) {
                        $this.parent().children('.btn-success').removeClass('hidden');
                        $this.addClass('hidden');
                        $this.parent().children('i').addClass('hidden');
                    } else {
                        $this.parent().children('.btn-danger').removeClass('hidden');
                        $this.addClass('hidden');
                        $this.parent().children('i').addClass('hidden');
                    }
                }
            };

            $('.do-action-schedule').click(function () {
                var id = $(this).data('id');
                var creneau = $(this).data('creneau');

                if (typeof id === 'undefined') {
                    var $listGroup = $(this).parent().prev();
                    if ($listGroup.children('.list-group-item').length === 0) {
                        $listGroup.children('i').addClass('invisible');
                    }
                    $.post('changeSchedule', {'creneau': creneau}, function (postData) {
                        if (postData.error && postData.error == 'full') {
                            alert('La partie est déjà pleine');
                        } else {
                            $listGroup.next().children('.btn-danger').data('id', postData.id);
                            $listGroup.prepend('<li class="list-group-item" data-id="' + postData.id + '"><img src="' + postData.img + '" alt="gravatar" /> ' + postData.username + '</li>');
                        }
                    });
                } else if (typeof creneau === 'undefined') {
                    var $item = $('.list-group-item[data-id=' + id + ']');
                    if ($item.parent('.list-group').children('.list-group-item').length === 1) {
                        $item.parent('.list-group').children('i').removeClass('invisible');
                    }
                    $item.remove();
                    $.post('changeSchedule', {'id': id});
                }
                toggleButtons($(this));
            });
            break;
        case 'useradmin':
            var span = $('#user-msg');
            var saveUser = function (data) {
                $.post('saveuser', data, function (ret) {
                    span.removeClass('hidden text-success text-danger');
                    if (ret === 'OK') {
                        span.addClass('text-success')
                            .text('Modifications enregistrées.');
                    } else {
                        span.addClass('text-danger')
                            .text('Modifications non enregistrées.');
                    }
                    setTimeout(function () {
                        span.addClass('hidden');
                    }, 3000);
                });
            };

            $('.role-selector').chosen();
            $('.save-user').click(function () {
                var data = {
                    id: $(this).data('id'),
                    enabled: $(this).parent().parent().find('input[name=enabled]').prop('checked') ? 1 : 0,
                    roles: $(this).parent().parent().find('select[name=roles]').val(),
                    position: $(this).parent().parent().find('select[name="position"]').val(),
                    email: $(this).parent().parent().find('input[name="email"]').val(),
                };

                saveUser(data);
            });

            $('#newUser').submit(function (e) {
                e.preventDefault();

                var data = {
                    enabled: $('#userenabled').prop('checked') ? 1 : 0,
                    roles: $('#userrole').val(),
                    position: $('#userposition').val(),
                    username: $('#useruser').val(),
                    password: $('#userpass').val(),
                    email: $('#usermail').val()
                };

                if (data.username === "" || data.password === "") {
                    span.removeClass('hidden text-success text-danger');
                    span.addClass('text-danger').text('Veuillez renseigner tous les champs.');
                    setTimeout(function () {
                        span.addClass('hidden');
                    }, 3000);
                    return false;
                }

                saveUser(data);
                return false;
            });
            break;
        case '':
            $('div[data-toggle="tooltip"], span[data-toggle="tooltip"]').tooltip();

            $.post('nbgame', {playerId: $(this).data('id')}, function (pdata) {
                $('#nbbaby').highcharts({
                    chart: {type: 'column'},
                    title: false,
                    legend: {enabled: false},
                    xAxis: {
                        categories: pdata.date,
                        labels: {enabled: false}
                    },
                    yAxis: {
                        min: 0,
                        title: {text: ''}
                    },
                    series: [
                        {
                            name: 'Nombre de parties',
                            data: pdata.nb
                        }
                    ], credits: {enabled: false}
                });
            });

            $('.table-creneau').on('click', '.participate', function(){
                $(this).hide();

                var $td = $(this).parent();
                var creneau = $td.data('creneau');

                $.post('changeSchedule', {'creneau': creneau}, function (postData) {
                    if (postData.error && postData.error == 'full') {
                        alert('La partie est déjà pleine');
                    } else {
                        $td.append('<span class="creneau-player creneau-me" data-toggle="tooltip" title="Ne plus participer" data-id="' + postData.id + '"><img src="' + postData.img + '" alt="gravatar"/> ' + postData.username + '</span>');
                    }
                });
            }).on('click', '.creneau-me', function(){
                $.post('changeSchedule', {'id': $(this).data('id')});
                $(this).parent().append('<button class="btn btn-success btn-sm pull-right participate">Go !</button>');
                $(this).remove();
            });

            $.post('morestat', {graphOnly:1}, function (pdata) {
                doTheChart(pdata);
            }, 'json');
            break;
    }

    function formatResult (player)
    {
        return '<div class="media"><a class="pull-left" href="#"><img class="media-object" src="' +
            $(player.element).data('img')
            + '" alt="Gravatar"></a><div class="media-body"><h4>' +
            player.text
            + '</h4></div></div>';

    }

    function doTheChart (pdata)
    {
        $('#chart1').highcharts({
            chart: {zoomType: 'xy'},
            credits: {enabled: false},
            title: {text: ''},
            plotOptions: { column: { stacking: 'normal' }},
            xAxis: {
                categories: pdata.graph.dates,
                labels: {enabled: false}
            },
            yAxis: [
                { min: 0, title: {text: 'Parties jouées'}},
                { min: 0, max: 1, title: {text: 'Score'}, opposite: true }
            ],
            series: [
                { yAxis: 0, name: 'Victoires', data: pdata.graph.victoires, type: 'column', color: '#77b300' },
                { yAxis: 0, name: 'Défaites', data: pdata.graph.defaites, type: 'column', color: '#f04124' },
                { yAxis: 1, name: 'Score', data: pdata.graph.score, type: 'spline', color: '#2a9fd6' }
            ],
            tooltip: { shared: true, borderRadius: 0 }
        });
    }
});
