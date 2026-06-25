import { useI18n } from '../i18n';

export function Loader() {
  return (
    <div className="center">
      <div className="spinner" />
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useI18n();
  return (
    <div className="center">
      <div style={{ textAlign: 'center' }}>
        <p>{message || t('error')}</p>
        {onRetry && (
          <button className="btn btn-sm" onClick={onRetry}>
            {t('loading')}
          </button>
        )}
      </div>
    </div>
  );
}

export function Empty({ message }) {
  const { t } = useI18n();
  return <div className="center">{message || t('empty')}</div>;
}

export function Stat({ icon, value, label, color = 'var(--lavender)' }) {
  return (
    <div className="card stat">
      <div className="dot" style={{ background: color + '22', color }}>{icon}</div>
      <div className="val">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}
