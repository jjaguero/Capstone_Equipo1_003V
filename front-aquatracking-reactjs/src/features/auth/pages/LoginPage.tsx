import { Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FormItem, Form } from '@/components/ui/Form';
import Alert from '@/components/ui/Alert';
import PasswordInput from '@/components/shared/PasswordInput';
import Logo from '@/components/template/Logo';
import { useLoginForm } from '../hooks/useLoginForm';

const LoginPage = () => {
  const { form, isSubmitting, errorMessage, mode, onSubmit } = useLoginForm();
  const { handleSubmit, formState: { errors }, control } = form;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8">
        <div className="mb-8">
          <Logo
            type="streamline"
            mode={mode}
            imgClass="mx-auto"
            logoWidth={60}
          />
        </div>
        <div className="mb-10">
          <h2 className="mb-2 text-center">AquaTracking</h2>
          <p className="font-semibold heading-text text-center">
            Sistema de Monitoreo de Consumo de Agua
          </p>
        </div>

        {errorMessage && (
          <Alert showIcon className="mb-4" type="danger">
            <span className="break-all">{errorMessage}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem
            label="Email"
            invalid={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="Ingrese su email"
                  autoComplete="email"
                  {...field}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Contraseña"
            invalid={Boolean(errors.password)}
            errorMessage={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  {...field}
                />
              )}
            />
          </FormItem>

          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="mt-4"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-500">
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
