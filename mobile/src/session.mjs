// Invalida respostas antigas e serializa gravações locais durante trocas de conta.
export function createSessionScope() {
  let revision = 0;
  let writes = Promise.resolve();
  const enqueue = action => {
    const result = writes.then(action);
    writes = result.catch(() => {});
    return result;
  };
  return {
    begin() { return ++revision; },
    current(ticket) { return ticket === revision; },
    ticket() { return revision; },
    write(ticket, action) { return enqueue(() => ticket === revision ? action() : undefined); },
    cleanup(action) { return enqueue(action); },
  };
}
