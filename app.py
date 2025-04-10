from flask import Flask, redirect, render_template, url_for

app = Flask(__name__, static_url_path='/static')

@app.get('/')
def index():
	# return render_template('Index.html')
	return redirect(url_for('winners_page', award='rim_protector', year=2025))
	
@app.get('/winners/<award>/<year>')
def winners_page(award, year):	
	return render_template('winners_page.html', award=award, year=year)