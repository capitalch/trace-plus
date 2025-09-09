## Cloudjiffy: Created AlmaLinux from DockerHub (docker image of almaLinux)

# Total process is
	- Create AlmaLinux new environment from Docker image
	- Install and configur NGINX for server and reverse proxy
	- install python from source
	- Install TraceServer dependencies
	- Upload code
	- Create startup.sh and place it in CMD entrypoint of Cloudjiffy env so that at restart this script is executed
	- Done

- New environment -> Select Image -> Search -> AlmaLinux -> Select official build and proceed
- Give environment name, set SSL on, set cloudlets. I selected env name as pilot
- The default user is root user with prompt '#' and not '$'. When prompt is # that means it is root user
- Docker image is successfully created and success email is sent

- Docker image behaves as linux box. As if u r working with Linux directly. From email:
	Env 1:
		Image Name: almalinux
		Hostname: node226391-almalinux.cloudjiffy.net
		Internal IPv4 address: 192.168.3.152
		You can connect to the node via SSH Gate.
		SSH Gate: ssh 226391-638@gate.cloudjiffy.com -p 3022
		Credentials for the root user:
		Login: root
		P: XdgrqffuwL
	Env 2:
		Image Name: almalinux
		Hostname: node227208-pilot.cloudjiffy.net
		Internal IPv4 address: 192.168.14.60
		You can connect to the node via SSH Gate.
		SSH Gate: ssh 227208-638@gate.cloudjiffy.com -p 3022
		Credentials for the root user:
		Login: root
		P: PkssNlJXqw

# In webSSH install nginx
sudo dnf update -y
sudo dnf install epel-release -y
sudo dnf install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Now if you browse at pilot.cloudjiffy.net welome page will appear if nginx is installed successfully
- /etc/nginx/nginx.config has config settings

- Nginx commands: may not be required
sudo systemctl restart nginx		: Restart Nginx 
sudo nginx -s reload				: Reload config (no stop)
sudo systemctl status nginx			: Check status
sudo nginx -t						: Test config syntax

- Direct nginx commands without systemctl. nginx will not start at boot time
sudo nginx           # Starts nginx directly
sudo nginx -s reload # Reloads config
sudo nginx -s stop   # Stops nginx process

# Setup nginx config file is at /etc/nginx/nginx.config
-- Reverse proxy means: /api/ is running at port 8000. if any /api/ call is found at port 80, it will be transferred to port 8000
-- anything in conf.d folder is taken as config because this folder is included in nginx.config
	- create a new file as /etc/nginx/conf.d/trace-server.conf as

server {
    listen 80;
    server_name TraceServer;

    # Serve React static files
    root /usr/share/nginx/html/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Reverse proxy to FastAPI (Uvicorn)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
  
  	location /graphql/ {
        proxy_pass http://127.0.0.1:8000/graphql/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
- check configuration file syntax
sudo nginx -t

# install python pip etc: takes time
- Install Build Dependencies
sudo dnf groupinstall "Development Tools" -y
sudo dnf install gcc openssl-devel bzip2-devel libffi-devel wget make zlib-devel readline-devel sqlite-devel xz-devel -y

- Download Python 3.13.3 Source Code
cd /usr/src
sudo wget https://www.python.org/ftp/python/3.13.3/Python-3.13.3.tgz
sudo tar xvf Python-3.13.3.tgz
cd Python-3.13.3

- Compile and Install
sudo ./configure --enable-optimizations
sudo make -j$(nproc)
sudo make altinstall

- Verify Python 3.13.3 Installation
python3.13 --version

- Create Symlinks for python and pip
	- Create python symlinks
	sudo ln -s /usr/local/bin/python3.13 /usr/bin/python
	- Create symlinks for pip
	sudo ln -s /usr/local/bin/pip3.13 /usr/bin/pip

# install TraceServer dependencies
pip install pydantic fastapi uvicorn[standard] typing ariadne bcrypt pyjwt[crypto] psycopg[binary,pool] python-multipart fpdf xlsxwriter fastapi_mail pandas cryptography

# Upload TraceServer and dist
- TraceServer folder as it is with config.py in it unaltered copy to final folder
- npm run build for react trace-client app. Copy the dist folder to final folder
- zip TraceServer and dist folder as say final.zip: final.zip: TraceServer and dist folders : I used winrar library for zip
- upload in folder /usr/share/nginx/html
	cd /usr/share/nginx/html
	unzip final.zip

# Disable Nginx Autostart : do this
sudo systemctl disable nginx

# I finally used startup.sh file to auto start nginx and fastapi
- create a startup.sh file as /usr/share/nginx/html/startup.sh
- set the APP_ENV as production or staging. APP_ENV is read by TraceServer and basedon that correct DB is connected through IP address of DB
- Create a new startup.sh file with following content. Don't upload the startup.sh file

#!/bin/bash
sudo nginx &
export APP_ENV=production
cd /usr/share/nginx/html/trace-server && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# At CMD / entry point of cloudjiffy server put /usr/share/nginx/html/startup.sh. default is /bin/bash
The & after line 1 in startup.sh does not block the command and proceeds

# restart the server
	- Check the run.log file
		- If any error inlog file, take care of that
		- If required, open the startup.sh, make small irrelevant changes like adding space and save. I did that because run.log showed some issues with startup.sh file

You can see the logs at /var/logs/run.log

This works fine. Cooool

# Start nginx at startup : not required : for knowledge
sudo systemctl enable nginx
- To start uvicorn manually
	uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# start uvicorn at startup : not required : for knowledge
	- At cloudjiffy entry point
	cd /usr/share/nginx/html/trace-server && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Reload nginx at config change : not required : for knowledge
sudo nginx -t && sudo systemctl reload nginx

## Handy Linux commands
- To see Linux distribution
cat /etc/os-release

## Failures
# Almalinux os 10.0 minimal On Oracle VirtualBox did not workout
# Debian on Oracle VirtualBox: Debian 12: Home Chitta: It freezes
	- Hostname: vbox
	- domain name: capitalch.virtualbox.com
	- root password: s3
	- username for new account: capitalch
	- pwd for new account capitalch: s3su$hant123

# Created Docker Engine. It does not provide the root user details
# Ubuntu env cannot be created in Cloudjiffy from docker image. Error: os not compatible