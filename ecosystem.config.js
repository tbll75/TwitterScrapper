module.exports = {
    apps: [{
      name: 'TwitterScrapper',
      script: './index.js'
    }],
    deploy: {
      production: {
        user: 'ubuntu',
        host: 'ec2-52-208-32-39.eu-west-1.compute.amazonaws.com',
        //key: '~/.ssh/tutorial-2.pem',
        key: '/Users/thib/.ssh/TwitterScrapper.pem',
        ref: 'origin/master',
        repo: 'git@github.com:tbll75/TwitterScrapper.git',
        path: '/home/bitnami',
        'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
      }
    }
  }