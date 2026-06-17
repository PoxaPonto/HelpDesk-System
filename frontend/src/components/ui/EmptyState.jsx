function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Os dados aparecerao aqui quando existirem.',
  action = null,
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">i</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export default EmptyState;
