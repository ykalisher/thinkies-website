from flask import Flask, redirect, render_template, url_for, abort
from json import load
app = Flask(__name__, static_url_path='/static')

with open('data.json', 'r') as f:
	data = load(f)
	
@app.get('/')
def index():
	year_data_reverse = {
		y: data['years'][y]
		for y in sorted(data['years'])[::-1]
	}
	return render_template('index.html', years=year_data_reverse, award_names=data['clean_award_names'])
	
	
@app.get('/winners/<award>/<int:year>')
def winners_page(award, year):
	award = award.replace('-', '_')
	if award not in data['clean_award_names'] or str(year) not in data['winners'][award]:
		abort(404)
	
	clean_award_name = data['clean_award_names'][award]
	winners = data['winners'][award][str(year)]
	# TODO: Better handling for ties
	first, second, third = winners['first'], winners['second'], winners['third']
	description = data['descriptions'][award]
	episode_link = data['winners'][award][str(year)]['link']
	return render_template(
		'winners_page.html', 
		award=clean_award_name, 
		year=year, 
		players={
			'first': first,
			'second': second,
			'third': third,
		},
		description=description,
		episode_link=episode_link,
	)
	
@app.get('/top-winners')
def top_winners():
	return render_template(
		'top_winners.html',
		players=data['top_5']
	)
	
@app.get('/player-wins/<name>')
def player_wins(name):
	name = name.replace('_', ' ')
	player = data['players'][name]
	return render_template(
		'player_wins.html',
		name=name,
		player=player,
		award_names=data['clean_award_names'],
		points=len(player['first']) * 3 + len(player['second']) * 2 + len(player['third']),
	)
	
@app.get('/player-index')
def player_index():
	return render_template('player_index_page.html', names=sorted(data['players']))
	

@app.get('/best_peaks')
def best_peaks():
	return render_template('best_peaks_page.html', players=data['best_peaks'])
	
@app.errorhandler(404)
def not_found(error):
	return render_template('404.html'), 404