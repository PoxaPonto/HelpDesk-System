function Loader({ label = 'Carregando dados' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
