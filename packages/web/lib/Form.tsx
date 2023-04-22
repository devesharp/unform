import { ForwardRefRenderFunction, forwardRef } from 'react'

import {
  FormProvider,
  FormContext,
  FormHandles,
  FormProps,
} from '@devesharp/unform-core'

const Form: ForwardRefRenderFunction<FormHandles, FormProps> = (
  { initialData = {}, children, onSubmit, persistHiddenData, ...rest },
  formRef
) => {
  return (
    <FormProvider
      ref={formRef}
      initialData={initialData}
      onSubmit={onSubmit}
      persistHiddenData={persistHiddenData}
    >
      <FormContext.Consumer>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} {...rest}>
            {children}
          </form>
        )}
      </FormContext.Consumer>
    </FormProvider>
  )
}

export default forwardRef(Form)
