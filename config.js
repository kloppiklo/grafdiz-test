window.QUIZ_API = {
  url: "https://hgzzpeyveyqygdmkcsjv.supabase.co",
  key: "sb_publishable_r1DhYNrWRcbJryDzCph2GQ_1t8SMm4g"
};

window.quizRpc = async function (fn, body) {
  const res = await fetch(window.QUIZ_API.url + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: window.QUIZ_API.key
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.message) || "HTTP " + res.status);
    err.status = res.status;
    throw err;
  }
  return data;
};
