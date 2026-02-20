---
{"dg-publish":true,"permalink":"/algoritmos/"}
---



A definição de algoritmos é uma sequência finita e ordenada de passos lógicos para resolver um problema ou atingir um objetivo.

Exemplo, se você precisa a travesar a rua, você segue um padrão de:

1. Olhar para a direita e depois para a esquerda
2. Se não houver carro vindo → atravessar
3. Senão → esperar e repetir o processo (loop)

Se colocar no código fica assim:

```
import time

r = ['sim', 's', 'y', 'yes']
  
print("Você chegou em ponto de atravessar a rua, então você")

time.sleep(2)

while True:

	print("Olha para a direita")
	time.sleep(2)
	print("Olha para a esquerda")
	time.sleep(2)
	
	rua = input("Pode atravessar a rua? ").lower()
	
	if rua in r:
		print("Atravessando...")
		break
	else:
		print("Ainda não pode. Olhando de novo...")
		time.sleep(1)

print("Você atravessou com segurança!")

```

