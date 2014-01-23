$(document).ready(function(){

	$('#formlogin').submit(function(e){
		e.preventDefault();
		$.post('login', {'login':$('#userlogin').val(), 'password':$('#userpwd').val()}, function(retdata){
			if(retdata.type != 'error'){
				window.location.reload();
			} else {
				//gestion erreur
			}
		});
		return false;
	})

	var t = window.location.pathname.split('/');

	switch(t[t.length - 1]) {
		case 'addgame':
			$('#form-addgame').submit(function(e){
				e.preventDefault();

				var error = "";

				if($('#score2').val() == $('#score1').val()){
					error = 'Erreur : Les deux scores ne peuvent pas être égaux.';
				}

				if($('#player1Team1').val() == $('#player2Team1').val() || $('#player1Team2').val() == $('#player2Team2').val()){
					error = 'Erreur : Même joueur présent dans la même équipe';
				}

				if($('#player1Team1').val() == $('#player1Team2').val() || $('#player1Team1').val() == $('#player2Team2').val() || $('#player2Team1').val() == $('#player1Team2').val() || $('#player2Team1').val() == $('#player2Team2').val()){
					error = 'Erreur : Même joueur présent dans deux équipes'
				}

				if($('#datepartie').val().trim() == ''){
					error = "Erreur : Veuillez spécifier une date";
				}

				if(error !== ""){
					$('#form-addgame-error').text(error).show("blind").delay(3000).hide("blind");
				} else {
					var data = {
						date:$('#datepartie').val(),
						joueur1equipe1:$('#player1Team1').val(),
						joueur2equipe1:$('#player2Team1').val(),
						joueur1equipe2:$('#player1Team2').val(),
						joueur2equipe2:$('#player2Team2').val(),
						score1:$('#score1').val(),
						score2:$('#score2').val()
					};
					$.post('savegame', data, function(ret){
						if(ret == 'ok'){
							$('#submitformgame').prop('disabled', true);
							$('#form-addgame-error').removeClass('text-danger').addClass('text-success');
							$('#form-addgame-error').text('Partie enregistrée !').show("blind").delay(2000).hide(300, function(){
								window.location.reload();
							});
						} else {
							$('#form-addgame-error').text('Erreur : La partie n\'a pas été enregistrée').show("blind").delay(3000).hide("blind");
						}
					});
				}
				return false;
			});

			$('#datepartie').pickadate({format : 'dd-mm-yyyy'});
		break;
		case 'game':
			$('#formSearchGame').submit(function(e){
				e.preventDefault();
				$('#form-recherche-error').text('Erreur : Ça marche pas encore tavu').show("blind").delay(3000).hide("blind");
				return false;
			});
		break;
		case 'player':
			$('.player').click(function(){
				var name = $(this).text();
				//loader modal ?
				$.post('morestat', {playerId: $(this).data('id')}, function(pdata){
					$('#chart1').highcharts({
						chart: { type: 'line' },
						title: { text: 'Evolution de ' + name },
						xAxis: {
							categories: pdata.dates
						},
						yAxis: [{
							min:0,
							title: { text: 'Parties jouées' }
						}, {
							min:0,
							max:1,
							title: { text: 'Ratio' },
							opposite: true
						}],
						series: [{
							yAxis:0,
							name: 'Victoires',
							data: pdata.victoires,
							color:'#77b300'
						}, {
							yAxis:0,
							name: 'Défaites',
							data: pdata.defaites,
							color: '#f04124'
						}, {
							yAxis:1,
							name: 'Ratio',
							data: pdata.ratio,
							color: '#2a9fd6'
						}]
					});
				});
			});
		break;
		case '':
			$.post('nbgame', {playerId: $(this).data('id')}, function(pdata){
				$('#nbbaby').highcharts({
					chart: { type: 'line' },
					title: { text: 'Nombre de parties jouées par jours' },
					xAxis: {
						categories: pdata.date
					},
					yAxis: {
						min:0,
						title: { text: 'Parties jouées' }
					},
					series: [{
						name: 'Nombre de parties',
						data: pdata.nb
					}]
				});
			});
		break;
	}
});