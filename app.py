from flask import Flask, redirect, render_template, url_for, abort
from json import load
app = Flask(__name__, static_url_path='/static')

with open('data.json', 'r') as f:
	data = load(f)
	
@app.get('/')
def index():
	# TODO: Menu of seasons, winners for this year, best
	return render_template('Index.html')
	
	
@app.get('/winners/<award>/<int:year>')
def winners_page(award, year):
	award = award.replace('-', '_')
	if award not in data['clean_award_names'] or str(year) not in data['winners'][award]:
		abort(404)
	
	clean_award_name = data['clean_award_names'][award]
	winners = data['winners'][award][str(year)]
	first, second, third = winners['first'], winners['second'], winners['third']
	description = data['descriptions'][award]
	episode_link = data['winners'][award][str(year)]['link']
	return render_template(
		'winners_page.html', 
		award=clean_award_name, 
		year=year, 
		first=first, 
		second=second, 
		third=third, 
		description=description,
		episode_link=episode_link,
	)
	
	
	
@app.errorhandler(404)
def not_found(error):
	#handle the error, for example a custom 404 page.
	return render_template('404.html'), 404