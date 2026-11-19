import { forwardRef, useId } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

const control =
    'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 transition focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';
const invalid = 'ring-rose-300 focus:ring-rose-500';

export const Input = forwardRef(function Input({ className = '', error, ...props }, ref) {
    return <input ref={ref} className={`${control} ${error ? invalid : ''} ${className}`} aria-invalid={!!error} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className = '', error, rows = 3, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={`${control} resize-y ${error ? invalid : ''} ${className}`} aria-invalid={!!error} {...props} />;
});

export const Select = forwardRef(function Select({ className = '', error, children, ...props }, ref) {
    return (
        <select ref={ref} className={`${control} pr-9 ${error ? invalid : ''} ${className}`} aria-invalid={!!error} {...props}>
            {children}
        </select>
    );
});

export function FieldError({ children, id }) {
    if (!children) return null;
    return (
        <p id={id} className="mt-1.5 flex items-start gap-1 text-sm text-rose-600" role="alert">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {children}
        </p>
    );
}

/**
 * Champ de formulaire complet : libellé, contrôle, aide et erreur.
 * Le contrôle enfant reçoit automatiquement `id` et `error` via la fonction render.
 *
 *   <Field label="Titre" required error={errors.title}>
 *     {(p) => <Input {...p} value={…} onChange={…} />}
 *   </Field>
 */
export default function Field({ label, hint, error, required = false, optional = false, className = '', children }) {
    const id = useId();
    const errorId = `${id}-error`;
    const props = { id, error, 'aria-describedby': error ? errorId : undefined, required };

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-gray-700">
                    <span>
                        {label}
                        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
                    </span>
                    {optional && <span className="text-xs font-normal text-gray-400">Facultatif</span>}
                </label>
            )}
            {typeof children === 'function' ? children(props) : children}
            {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
            <FieldError id={errorId}>{error}</FieldError>
        </div>
    );
}
