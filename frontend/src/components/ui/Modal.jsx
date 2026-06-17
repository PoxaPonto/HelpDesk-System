function Modal({ title, description, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <p className="header-eyebrow">Confirmacao</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">
            X
          </button>
        </div>

        {description && <p className="modal-description">{description}</p>}
        <div className="modal-actions">{children}</div>
      </section>
    </div>
  );
}

export default Modal;
