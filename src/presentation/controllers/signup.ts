import { AddAccount } from '../../domain/usecases/add-account'
import { InvalidParamError, MissingParamError } from '../errors'
import { badRequest, serverError } from '../helpers'
import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../protocols'

export class SignUpController implements Controller {
  private readonly addAccount: AddAccount
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator, addAccount: AddAccount) {
    this.addAccount = addAccount
    this.emailValidator = emailValidator
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['email', 'name', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { email, name, password, passwordConfirmation } = httpRequest.body

      const passwordMatch = password === passwordConfirmation
      if (!passwordMatch) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValidEmail = this.emailValidator.isValid(email)
      if (!isValidEmail) {
        return badRequest(new InvalidParamError('email'))
      }

      this.addAccount.add({
        name,
        email,
        password
      })

      return {
        statusCode: 200,
        body: ''
      }
    } catch (error) {
      return serverError()
    }
  }
}
