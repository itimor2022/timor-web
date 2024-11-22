build:
	docker build -t tangsengdaodaowebultimate .
deploy:
	docker build -t tangsengdaodaowebultimate  .
	docker tag tangsengdaodaowebultimate registry.cn-shanghai.aliyuncs.com/wukongim/tangsengdaodaoweb:latest-ultimate
	docker push registry.cn-shanghai.aliyuncs.com/wukongim/tangsengdaodaoweb:latest-ultimate