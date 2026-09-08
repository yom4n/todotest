CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  sku text,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION slow_checkout(sku text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_sleep(0.4);
  INSERT INTO orders(sku) VALUES (sku);
  RETURN 'ok';
END;
$$;
