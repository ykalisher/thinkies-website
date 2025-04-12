from json import load, dump

with open('data.json', 'r') as f:
	data = load(f)
	
	
updated_players = {
	
}

for award in data['winners']:
	for year in data['winners'][award]:
		first = data['winners'][award][year]['first']
		second = data['winners'][award][year]['second']
		third = data['winners'][award][year]['third']
	
	
		def check_name(name, headshot_url):
			if name not in updated_players:
				updated_players[name] = {
					'first': [],
					'second': [],
					'third': [],
					'headshot_url': headshot_url,
				}
			elif updated_players[name]['headshot_url'] == '':
				updated_players[name]['headshot_url'] = headshot_url
		
		check_name(first['name'], first['headshot_url'])
		updated_players[first['name']]['first'].append((award, year))
		
		if ',' in second['name']:
			for name in second['name'].split(', '):
				check_name(name, '')
				updated_players[name]['second'].append((award, year))
		else:
			check_name(second['name'], second['headshot_url'])
			updated_players[second['name']]['second'].append((award, year))
			
		if ',' in third['name']:
			for name in third['name'].split(', '):
				check_name(name, '')
				updated_players[name]['third'].append((award, year))
		else:
			check_name(third['name'], third['headshot_url'])
			updated_players[third['name']]['third'].append((award, year))
		

data['players'] = updated_players
player_totals = []


for player in data['players']:
	player_totals.append({
		'name': player,
		'points': len(data['players'][player]['first']) * 3 + len(data['players'][player]['second']) * 2 + len(data['players'][player]['first']) * 1,
		'headshot_url': data['players'][player]['headshot_url'],
	})
	
top = {
	'first': None,
	'second': None,
	'third': None,
	'fourth': None,
	'fifth': None
}

for player in player_totals:
	
	if top['fifth'] is None or player['points'] > top['fifth']['points']:
		top['fifth'] = player
		
	if top['fourth'] is None or player['points'] > top['fourth']['points']:
		top['fifth'] = top['fourth']
		top['fourth'] = player
		
	if top['third'] is None or player['points'] > top['third']['points']:
		top['fourth'] = top['third']
		top['third'] = player
	
	if top['second'] is None or player['points'] > top['second']['points']:
		top['third'] = top['second']
		top['second'] = player
	
	if top['first'] is None or player['points'] > top['first']['points']:
		top['second'] = top['first']
		top['first'] = player
	

data['top_5'] = top

with open('new_data.json', 'w') as f:
	dump(data, f)