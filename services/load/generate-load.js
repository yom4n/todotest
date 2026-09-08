const targetUrl = process.env.TARGET_URL || "http://localhost:3000";
const total = Number(process.env.CONCURRENCY || 30);

async function fireCheckout(index) {
  try {
    const response = await fetch(`${targetUrl}/checkout`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ sku: `load-test-sku-${index}` })
    });

    return response.status;
  } catch (error) {
    return error instanceof Error ? error.message : "request failed";
  }
}

async function main() {
  const statuses = await Promise.all(
    Array.from({ length: total }, (_value, index) => fireCheckout(index))
  );

  const summary = {
    total,
    ok: statuses.filter((status) => status === 200 || status === 201).length,
    gateway_timeout_504: statuses.filter((status) => status === 504).length
  };

  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
