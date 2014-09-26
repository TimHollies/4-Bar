from urllib.request import urlopen

for x in range(1, 10000):	
	try:
		website = urlopen("http://thesession.org/tunes/%d/abc/" % (x))
		if website.getcode() == 200:
			print(website.read())
	except:
		print("fail")