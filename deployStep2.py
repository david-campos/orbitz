#!/usr/bin/env python3
import fileinput

lines=[]
with open("deploy\index.html", "rt") as fin:
	replace=False
	for line in fin:
		if "<!-- @REPLACE FROM THIS LINE ON DEPLOY -->" in line:
			replace=True
			lines.append('\t<link rel="stylesheet" href="theCss.css">\n')
			lines.append('\t<script language="text/javascript" src="theScript.js"></script>\n')
		elif "<!-- @REPLACE END -->" in line:
			replace=False
		else:
			if not replace:
				lines.append(line)
with open("deploy\index.html", "wt") as fout:
	for line in lines:
		fout.write(line)