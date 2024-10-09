import { RefObject, useState } from 'react'

import { act, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect.js'

import { Form } from '../../web/lib'
import { Scope, FormHandles } from '../lib'
import { Input } from './components/Input'
import {ObjectInput, ObjectInput2} from './components/ObjectInput'
import { CustomInputClear } from './utils/CustomInputClear'
import { CustomInputParse } from './utils/CustomInputParse'
import { render } from './utils/RenderTest'

describe('Form', () => {
  it('should render form elements', () => {
    const { container } = render(<Input name="name" />)

    expect(!!container.querySelector('input[name=name]')).toBe(true)
  })

  it('should load initial data inside form elements', () => {
    const { container } = render(<Input name="name" />, {
      initialData: { name: 'Diego' },
    })

    expect(container.querySelector('input[name=name]')).toHaveAttribute(
      'value',
      'Diego'
    )
  })

  it('should return form elements data on submit', () => {
    const submitMock = jest.fn()

    const { getByTestId, getByLabelText } = render(
      <>
        <Input name="name" />
        <Scope path="address">
          <Input name="street" />
        </Scope>
      </>,
      {
        onSubmit: submitMock,
        initialData: { address: { street: 'John Doe Avenue' } },
      }
    )

    fireEvent.change(getByLabelText('name'), {
      target: { value: 'Diego' },
    })

    fireEvent.submit(getByTestId('form'))

    expect(submitMock).toHaveBeenCalledWith(
      {
        name: 'Diego',
        address: {
          street: 'John Doe Avenue',
        },
      },
      {
        reset: expect.any(Function),
      },
      expect.any(Object)
    )
  })

  it('should remove unmounted elements from refs', () => {
    const submitMock = jest.fn()

    const { getByTestId, rerender } = render(<Input name="name" />, {
      onSubmit: submitMock,
      initialData: { name: 'Diego' },
    })

    rerender(
      <Form data-testid="form" onSubmit={submitMock}>
        <Input name="another" />
      </Form>
    )

    fireEvent.submit(getByTestId('form'))

    expect(submitMock).toHaveBeenCalledWith(
      {
        another: 'Diego',
      },
      {
        reset: expect.any(Function),
      },
      expect.any(Object)
    )
  })

  it('should reset form data when reset helper is dispatched', () => {
    const { getByTestId, getByLabelText } = render(
      <>
        <Input name="name" />
      </>,
      { onSubmit: (_: any, { reset }: { reset: Function }) => reset() }
    )

    getByLabelText('name').setAttribute('value', 'Diego')

    fireEvent.submit(getByTestId('form'))

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('')
  })

  it('should apply data when reset is dispatched with new values', () => {
    const newData = {
      name: 'John Doe',
      tech: 'react',
    }

    const { getByTestId, getByLabelText } = render(
      <>
        <Input name="name" />
      </>,
      {
        onSubmit: (_: any, { reset }: { reset: Function }) => reset(newData),
      }
    )

    getByLabelText('name').setAttribute('value', 'Diego')

    fireEvent.submit(getByTestId('form'))

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('John Doe')
  })

  it('should be able to have custom value parser', () => {
    const submitMock = jest.fn()

    const { getByTestId } = render(
      <>
        <CustomInputParse name="name" />
      </>,
      { onSubmit: submitMock, initialData: { name: 'Diego' } }
    )

    fireEvent.submit(getByTestId('form'))

    expect(submitMock).toHaveBeenCalledWith(
      {
        name: 'Diego-test',
      },
      {
        reset: expect.any(Function),
      },
      expect.any(Object)
    )
  })

  it('should be able to have custom value clearer', () => {
    const { getByTestId, getByLabelText } = render(
      <>
        <CustomInputClear name="name" />
      </>,
      {
        onSubmit: (_: any, { reset }: { reset: Function }) => reset(),
        initialData: { name: 'Diego' },
      }
    )

    fireEvent.submit(getByTestId('form'))

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('test')
  })

  it.only('should be able to manually set field value', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByLabelText } = render(
      <>
        <Input name="name" />
        <ObjectInput2 name="another" />
      </>,
      {
        ref: formRef,
      }
    )

    if (formRef.current) {
      formRef.current.setFieldValue('name', 'John Doe')
      formRef.current.setFieldValue('another', { id: '5', label: 'Test' })

      const valueNonExistent = formRef.current.setFieldValue(
        'notexists',
        'John Doe'
      )

      expect(valueNonExistent).toBe(false)
    }

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('John Doe')
    // expect((getByLabelText('another') as HTMLInputElement).value).toBe('5')
  })

  it('should be able to manually get field value', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    render(
      <>
        <Input name="name" />
      </>,
      {
        ref: formRef,
        initialData: { name: 'John Doe' },
      }
    )

    if (formRef.current) {
      const value = formRef.current.getFieldValue('name')
      const valueNonExistent = formRef.current.getFieldValue('notexists')

      expect(value).toBe('John Doe')
      expect(valueNonExistent).toBe(false)
    }
  })

  it('should be able to manually set field error', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByText } = render(
      <>
        <Input name="name" />
      </>,
      {
        onSubmit: (_: any, { reset }: { reset: Function }) => reset(),
        ref: formRef,
      }
    )

    act(() => {
      if (formRef.current) {
        formRef.current.setFieldError('name', 'Name is required')
      }
    })

    expect(!!getByText('Name is required')).toBe(true)
  })

  it('should be able to manually get field error', async () => {
    const formRef: RefObject<FormHandles> = { current: null }

    render(
      <>
        <Input name="name" />
      </>,
      {
        ref: formRef,
      }
    )

    act(() => {
      if (formRef.current) {
        formRef.current.setFieldError('name', 'Name is required')
      }
    })

    await waitFor(() => {
      if (formRef.current) {
        const error = formRef.current.getFieldError('name')

        expect(error).toBe('Name is required')
      }
    })
  })

  it('should be able to manually clear field value', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByLabelText } = render(
      <>
        <Input name="name" />
        <CustomInputClear name="bio" />
      </>,
      {
        ref: formRef,
        initialData: { name: 'Diego', bio: 'Should clear' },
      }
    )

    if (formRef.current) {
      formRef.current.clearField('name')
      formRef.current.clearField('bio')
    }

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('')
    expect((getByLabelText('bio') as HTMLInputElement).value).toBe('test')
  })

  it('should be able to clear input error from within it', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByLabelText } = render(<Input name="name" />, {
      ref: formRef,
    })

    act(() => {
      if (formRef.current) {
        formRef.current.setFieldError('name', 'Name is required')
      }

      fireEvent.focus(getByLabelText('name') as HTMLInputElement)
    })

    expect(formRef.current?.getFieldError('name')).toBeUndefined()
  })

  it('should be able to manually set form data', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByLabelText } = render(
      <>
        <Input name="name" />
        <Input name="bio" />
        <ObjectInput name="another" />
      </>,
      {
        ref: formRef,
      }
    )

    if (formRef.current) {
      formRef.current.setData({
        name: 'John Doe',
        bio: 'React developer',
        another: {
          id: '5',
          label: 'Test',
        },
      })
    }

    expect((getByLabelText('name') as HTMLInputElement).value).toBe('John Doe')
    expect((getByLabelText('bio') as HTMLInputElement).value).toBe(
      'React developer'
    )
    expect((getByLabelText('another') as HTMLInputElement).value).toBe('5')
  })

  it('should be able to manually get form data', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    render(
      <>
        <Input name="name" />
        <Input name="bio" />
      </>,
      {
        ref: formRef,
        initialData: { name: 'John Doe', bio: 'React developer' },
      }
    )

    if (formRef.current) {
      const data = formRef.current.getData()

      expect(data).toEqual({ name: 'John Doe', bio: 'React developer' })
    }
  })

  it('should be able to manually set form errors', async () => {
    const formRef: RefObject<FormHandles> = { current: null }

    render(
      <>
        <Input name="name" />
        <Input name="bio" />
      </>,
      {
        ref: formRef,
      }
    )

    act(() => {
      if (formRef.current) {
        formRef.current.setErrors({
          name: 'Name is required',
          bio: 'Bio is required',
        })
      }
    })

    await waitFor(() => {
      if (formRef.current) {
        const errorName = formRef.current.getFieldError('name')
        const errorBio = formRef.current.getFieldError('bio')
        const errors = formRef.current.getErrors()

        expect(errorName).toBe('Name is required')
        expect(errorBio).toBe('Bio is required')
        expect(errors).toEqual({
          name: 'Name is required',
          bio: 'Bio is required',
        })
      }
    })
  })

  it('should be able to manually get field ref', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    render(
      <>
        <Input name="name" />
      </>,
      {
        ref: formRef,
      }
    )

    if (formRef.current) {
      const ref = formRef.current.getFieldRef('name')
      const refNonExistent = formRef.current.getFieldRef('notexists')

      expect((ref as HTMLInputElement).name).toBe('name')
      expect(refNonExistent).toBe(false)
    }
  })

  it('should be able to manually reset form', () => {
    const formRef: RefObject<FormHandles> = { current: null }

    const { getByLabelText } = render(
      <>
        <Input name="name" />
      </>,
      {
        ref: formRef,
        initialData: { name: 'John Doe' },
      }
    )

    if (formRef.current) {
      formRef.current.reset()

      expect((getByLabelText('name') as HTMLInputElement).value).toBe('')
    }
  })

  it('should return form elements data on submit', () => {
    const submitMock = jest.fn()

    function Component() {
      const [show, setShow] = useState(false)

      return (
        <>
          <Input name="name" />
          <Scope path="address">
            <Input name="street" />
          </Scope>
          <button
            data-testid="button"
            type="button"
            onClick={() => setShow(!show)}
          >
            Button
          </button>
          {show && <Input name="another" />}
        </>
      )
    }

    const { getByTestId, getByLabelText } = render(<Component />, {
      onSubmit: submitMock,
      initialData: {
        address: { street: 'John Doe Avenue' },
        another: 'Other name',
      },
    })

    fireEvent.submit(getByTestId('form'))

    fireEvent.change(getByLabelText('name'), {
      target: { value: 'Diego' },
    })

    fireEvent.click(getByTestId('button'))

    fireEvent.submit(getByTestId('form'))

    expect(submitMock).toHaveBeenCalledWith(
      {
        name: 'Diego',
        another: 'Other name',
        address: {
          street: 'John Doe Avenue',
        },
      },
      {
        reset: expect.any(Function),
      },
      expect.any(Object)
    )
  })
})

it('should be persist data hidden data', () => {
  const formRef: RefObject<FormHandles> = { current: null }
  const submitMock = jest.fn()

  function Component() {
    const [show, setShow] = useState(false)

    return (
      <>
        <Input name="name" />
        <Scope path="address">
          <Input name="street" />
        </Scope>
        <button
          data-testid="button"
          type="button"
          onClick={() => setShow(!show)}
        >
          Button
        </button>
        {show && <Input name="another" />}
      </>
    )
  }

  const { getByLabelText, getByTestId } = render(<Component />, {
    onSubmit: submitMock,
    ref: formRef,
  })

  if (formRef.current) {
    formRef.current.setData({
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    })
  }

  fireEvent.click(getByTestId('button'))

  fireEvent.submit(getByTestId('form'))

  expect(submitMock).toHaveBeenCalledWith(
    {
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    },
    {
      reset: expect.any(Function),
    },
    expect.any(Object)
  )
})

it('should be not persist data on get data if hidden', () => {
  const formRef: RefObject<FormHandles> = { current: null }
  const submitMock = jest.fn()

  function Component() {
    const [show, setShow] = useState(false)

    return (
      <>
        <Input name="name" />
        <Scope path="address">
          <Input name="street" />
        </Scope>
        <button
          data-testid="button"
          type="button"
          onClick={() => setShow(!show)}
        >
          Button
        </button>
        {show && <Input name="another" />}
      </>
    )
  }

  const { getByLabelText, getByTestId } = render(<Component />, {
    onSubmit: submitMock,
    ref: formRef,
  })

  if (formRef.current) {
    formRef.current.setData({
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    })
  }

  fireEvent.submit(getByTestId('form'))

  expect(submitMock).toHaveBeenCalledWith(
    {
      name: 'Diego',
      address: {
        street: 'John Doe Avenue',
      },
    },
    {
      reset: expect.any(Function),
    },
    expect.any(Object)
  )
})

it('should be persist data hidden with option persistHiddenData', () => {
  const formRef: RefObject<FormHandles> = { current: null }
  const submitMock = jest.fn()

  function Component() {
    const [show, setShow] = useState(false)

    return (
      <>
        <Input name="name" />
        <Scope path="address">
          <Input name="street" />
        </Scope>
        <button
          data-testid="button"
          type="button"
          onClick={() => setShow(!show)}
        >
          Button
        </button>
        {show && <Input name="another" />}
      </>
    )
  }

  const { getByLabelText, getByTestId } = render(<Component />, {
    onSubmit: submitMock,
    ref: formRef,
    persistHiddenData: true,
  })

  if (formRef.current) {
    formRef.current.setData({
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    })
  }

  fireEvent.submit(getByTestId('form'))

  expect(submitMock).toHaveBeenCalledWith(
    {
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    },
    {
      reset: expect.any(Function),
    },
    expect.any(Object)
  )
})

it('should be persist data hidden with option persistHiddenData', () => {
  const formRef: RefObject<FormHandles> = { current: null }
  const submitMock = jest.fn()

  function Component() {
    const [show, setShow] = useState(false)

    return (
      <>
        <Input name="name" />
        <button
          data-testid="button"
          type="button"
          onClick={() => setShow(!show)}
        >
          Button
        </button>
        {show && <Input name="another" />}
      </>
    )
  }

  const { getByLabelText, getByTestId } = render(<Component />, {
    onSubmit: submitMock,
    ref: formRef,
    persistHiddenData: true,
  })

  if (formRef.current) {
    formRef.current.setData({
      name: 'Diego',
      another: 'Other name',
      address: {
        street: 'John Doe Avenue',
      },
    })

    formRef.current.reset();
    formRef.current.setFieldValue('name', 'Diego 2')
  }

  fireEvent.submit(getByTestId('form'))

  expect(submitMock).toHaveBeenCalledWith(
    {
      name: 'Diego 2',
    },
    {
      reset: expect.any(Function),
    },
    expect.any(Object)
  )
})
