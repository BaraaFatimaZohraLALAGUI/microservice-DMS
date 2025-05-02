# translation-microservice-DMS
backend implementation: first deliverables, translation microservice for titel translation using gemini api 

- the communication flow diagram of the microservice:

![communication flow diagram](https://github.com/user-attachments/assets/c46d222a-3929-45ae-9d64-ba3e11c4b7de)


- how to run:
  - python side: `uvicorn app.main:app --reload`
      - checking the translation using the python side: `curl.exe -X POST http://localhost:8000/translate/{doc_id_test} -H "Content-Type: application/json" -d '{"text":"hello"}'`

