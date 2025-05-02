from confluent_kafka import Producer, Consumer
import json

class KafkaHandler:
    def __init__(self, bootstrap_servers: str):
        self.producer_config = {'bootstrap.servers': bootstrap_servers}
        self.consumer_config = {
            'bootstrap.servers': bootstrap_servers,
            'group.id': 'translation-service',
            'auto.offset.reset': 'earliest'
        }
    
    def send_translation(self, topic: str, doc_id: str, translated_title: str):
        producer = Producer(self.producer_config)
        producer.produce(
            topic=topic,
            key=str(doc_id),
            value=json.dumps({
                "doc_id": doc_id,
                "translated_title": translated_title
            })
        )
        producer.flush()
    
    def consume_documents(self, topic: str, callback):
        consumer = Consumer(self.consumer_config)
        consumer.subscribe([topic])
        
        try:
            while True:
                msg = consumer.poll(1.0)
                if msg is None:
                    continue
                if msg.error():
                    print(f"Consumer error: {msg.error()}")
                    continue
                
                data = json.loads(msg.value())
                callback(data)
        except KeyboardInterrupt:
            pass
        finally:
            consumer.close()