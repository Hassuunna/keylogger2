```sql

CREATE TABLE `local_schema`.`logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `log` VARCHAR(45) NOT NULL,
  `datetime` DATETIME NULL,
  PRIMARY KEY (`id`)
  );

SELECT * FROM local_schema.logs;

INSERT INTO `local_schema`.`logs`
(`log`, `datetime`)
VALUES ( ? , CURRENT_TIMESTAMP);

```