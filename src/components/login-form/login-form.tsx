import React from 'react';
import { StyleGenerator } from '../styling/style-generator.service';
import { OffsetStyle } from '../styling/offset-style';
import { htmlAttributes } from 'sitefinity-react-framework/widgets/attributes';
import { classNames } from 'sitefinity-react-framework/utils/classNames';
import { WidgetContext } from 'sitefinity-react-framework/widgets/widget-context';
import { PostLoginAction } from './interfaces/PostLoginAction';
import { StylingConfig } from '../styling/styling-config';
import { getUniqueId } from 'sitefinity-react-framework/utils/getUniqueId';
import { RestExtensionsService } from 'sitefinity-react-framework/sdk/rest-extensions';
import { RestSdkTypes, RestService } from 'sitefinity-react-framework/sdk/rest-service';
import { FilterConverterService } from 'sitefinity-react-framework/sdk/filters/filter-converter';
import { MixedContentContext } from 'sitefinity-react-framework/widgets/entities/mixed-content-context';
import { ExternalLoginBase } from 'sitefinity-react-framework/login/external-login-base';
import { ExternalProvider } from 'sitefinity-react-framework/sdk/dto/external-provider';
import { CollectionResponse } from 'sitefinity-react-framework/sdk/dto/collection-response';

const defaultMixedContent = {
    ItemIdsOrdered:null,
    Content:[ {
        Type:RestSdkTypes.Pages,
        Variations:null
    }]
};


export async function LoginForm(props: WidgetContext<LoginFormEntity>) {
    const entity = {
        PostLoginRedirectPage: defaultMixedContent,
        RegistrationPage: defaultMixedContent,
        ResetPasswordPage: defaultMixedContent,
        PostLoginAction: 0,
        Header: 'Login',
        EmailLabel: 'Email / Username',
        PasswordLabel: 'Password',
        SubmitButtonLabel: 'Log in',
        ErrorMessage: 'Incorrect credentials.',
        RememberMeLabel: 'Remember me',
        ForgottenPasswordLinkLabel: 'Forgotten password',
        NotRegisteredLabel: 'Not registered yet?',
        RegisterLinkText: 'Register now',
        ExternalProvidersHeader: 'or use account in...',
        ValidationRequiredMessage: 'All fields are required.',
        ValidationInvalidEmailMessage: 'Invalid email format.',
        ...props.model.Properties
    };
    const context = props.requestContext;
    // console.log('context', context);
   // console.log('entity', entity);
    const dataAttributes = htmlAttributes(props);

    const defaultClass =  entity.CssClass;
    const marginClass = entity.Margins && StyleGenerator.getMarginClasses(entity.Margins);

    dataAttributes['className'] = classNames(
        defaultClass,
        marginClass
        );
    // dataAttributes['data-sfemptyicontext'] = 'Create call to action';
    // dataAttributes['data-sfhasquickeditoperation'] = true;

    const viewModel: any = {
        LoginHandlerPath: '/sitefinity/login-handler',
        RememberMe: entity.RememberMe,
        MembershipProviderName: entity.MembershipProviderName,
        Attributes: entity.Attributes,
        Labels: {}
    };

if (entity.ExternalProviders && entity.ExternalProviders.length){
    const argsLocal = {
        Name: 'Default.GetExternalProviders'
    };
    const externalProviders: CollectionResponse<ExternalProvider> = await RestService.getUnboundType(argsLocal);
    viewModel.ExternalProviders = externalProviders.Items.filter(p => entity.ExternalProviders?.indexOf(p.Name) !== -1);
}

viewModel.Labels.EmailLabel = entity.EmailLabel;
viewModel.Labels.ErrorMessage = entity.ErrorMessage;
viewModel.Labels.ExternalProvidersHeader = entity.ExternalProvidersHeader;
viewModel.Labels.ForgottenPasswordLinkLabel = entity.ForgottenPasswordLinkLabel;
viewModel.Labels.Header = entity.Header;
viewModel.Labels.NotRegisteredLabel = entity.NotRegisteredLabel;
viewModel.Labels.PasswordLabel = entity.PasswordLabel;
viewModel.Labels.RegisterLinkText = entity.RegisterLinkText;
viewModel.Labels.RememberMeLabel = entity.RememberMeLabel;
viewModel.Labels.SubmitButtonLabel = entity.SubmitButtonLabel;
viewModel.Labels.ValidationInvalidEmailMessage = entity.ValidationInvalidEmailMessage;
viewModel.Labels.ValidationRequiredMessage = entity.ValidationRequiredMessage;
viewModel.VisibilityClasses = StylingConfig.VisibilityClasses;
viewModel.InvalidClass = StylingConfig.InvalidClass;

const postLoginRedirectVariations = (entity.PostLoginRedirectPage?.Content)[0].Variations;
if (entity.PostLoginAction === PostLoginAction.RedirectToPage
   && postLoginRedirectVariations && postLoginRedirectVariations.length !== 0){
    const mainFilter = FilterConverterService.getMainFilter(postLoginRedirectVariations[0]);
    const pageNodes = await RestExtensionsService.getContextItems(entity.PostLoginRedirectPage, {
        Type: RestSdkTypes.Pages,
        Fields: ['ViewUrl'],
        Filter: mainFilter
    });
    const items = pageNodes.Items;
    if (items.length === 1){
        viewModel.RedirectUrl =  items[0].ViewUrl;
    }
}

const registrationVariations = (entity.RegistrationPage?.Content)[0].Variations;
if (registrationVariations && registrationVariations.length !== 0){
     const mainFilter = FilterConverterService.getMainFilter(registrationVariations[0]);
     const pageNodes = await RestExtensionsService.getContextItems(entity.RegistrationPage, {
         Type: RestSdkTypes.Pages,
         Fields: ['ViewUrl'],
         Filter: mainFilter
     });

     const items = pageNodes.Items;
     if (items.length === 1){
         viewModel.RegistrationLink =  items[0].ViewUrl;
     }
 }

const resetPasswordVariations = (entity.ResetPasswordPage?.Content)[0].Variations;
if (resetPasswordVariations && resetPasswordVariations.length !== 0){
    const mainFilter = FilterConverterService.getMainFilter(resetPasswordVariations[0]);
    const pageNodes = await RestExtensionsService.getContextItems(entity.ResetPasswordPage, {
        Type: RestSdkTypes.Pages,
        Fields: ['ViewUrl'],
        Filter: mainFilter
    });

    const items = pageNodes.Items;
    if (items.length === 1){
        viewModel.ForgottenPasswordLink = items[0].ViewUrl;
    }
}

// this.httpContextAccessor.HttpContext.AddVaryByQueryParams(ExternalLoginBase.ErrorQueryKey);
// if (viewModel.IsError(this.httpContextAccessor.HttpContext))
// {
//     this.httpContextAccessor.HttpContext.DisableCache();
// }
const labels = viewModel.Labels;
const returnUrl = viewModel.RedirectUrl ?? ExternalLoginBase.GetDefaultReturnUrl(context);
const returnErrorUrl = ExternalLoginBase.GetDefaultReturnUrl(context, {isError:true, shouldEncode:false});

const usernameInputId = getUniqueId('sf-username-');
const passwordInputId = getUniqueId('sf-password-');
const rememberInputId = getUniqueId('sf-rememeber-');
const passResetColumnSize = viewModel.RememberMe ? 'col-md-6 text-end' : 'col-12';
    return (
      <div
        {...dataAttributes}
      //  {...wrapperCustomAttributes}
        >
        <div data-sf-role="form-container">
          <h2 className="mb-3">{labels.Header}</h2>
          <div id="errorContainer"
            className={`alert alert-danger my-3 ${ExternalLoginBase.isError(context) ? 'd-block' : 'd-none'}`}
            role="alert" aria-live="assertive" data-sf-role="error-message-container">{labels.ErrorMessage}</div>
          <form action={viewModel.LoginHandlerPath} method="post" role="form" noValidate={true}>
            <div className="mb-3">
              <label htmlFor={usernameInputId} className="form-label">{labels.EmailLabel}</label>
              <input type="email" className="form-control" id={usernameInputId} name="username" data-sf-role="required" />
            </div>
            <div className="mb-3">
              <label htmlFor={passwordInputId} className="form-label">{labels.PasswordLabel}</label>
              <input type="password" className="form-control" id={passwordInputId} name="password" data-sf-role="required"
                autoComplete="on" />
            </div>
            {(viewModel.RememberMe !== undefined || viewModel.ForgottenPasswordLink) &&
            <div className="row mb-3">
              {viewModel.RememberMe !== undefined &&
              <div className="checkbox col-md-6 m-0">
                <label>
                  <input defaultChecked={viewModel.RememberMe} data-val="true" data-val-required="The RememberMe field is required." id={rememberInputId}
                    name="RememberMe" type="checkbox" defaultValue={viewModel.RememberMe} />
                  <label htmlFor={rememberInputId}>{labels.RememberMeLabel}</label>
                </label>
              </div>
                    }

              {viewModel.ForgottenPasswordLink &&

              <div className={passResetColumnSize}>
                <a href={viewModel.ForgottenPasswordLink}
                  className="text-decoration-none">{labels.ForgottenPasswordLinkLabel}</a>
              </div>
                    }
            </div>
            }

            <input type="hidden" name="RedirectUrl" value={returnUrl} />
            <input type="hidden" name="ErrorRedirectUrl" value={returnErrorUrl} />
            <input type="hidden" name="MembershipProviderName" value={viewModel.MembershipProviderName} />
            <input type="hidden" value="" name="sf_antiforgery" />

            <input className="btn btn-primary w-100" type="submit" value={labels.SubmitButtonLabel} />
          </form>

          <input type="hidden" name="ValidationInvalidEmailMessage" value={labels.ValidationInvalidEmailMessage} />
          <input type="hidden" name="ValidationRequiredMessage" value={labels.ValidationRequiredMessage} />
        </div>

        {viewModel.RegistrationLink &&
        <div className="row mt-3">
          <div className="col-md-6">{labels.NotRegisteredLabel}</div>
          <div className="col-md-6 text-end"><a href={viewModel.RegistrationLink}
            className="text-decoration-none">{labels.RegisterLinkText}</a></div>
        </div>
    }

        {viewModel.ExternalProviders && viewModel.ExternalProviders.length &&

        [<h3 key={100} className="mt-3">{labels.ExternalProvidersHeader}</h3>,
            viewModel.ExternalProviders.map((provider: ExternalProvider, idx: number) => {
                const providerClass = ExternalLoginBase.GetExternalLoginButtonCssClass(provider.Name);
                const providerHref = ExternalLoginBase.GetExternalLoginPath(context, provider.Name);

                return (
                  <a key={idx} data-sf-test="extPrv"
                    className={classNames('btn border fs-5 w-100 mt-2',providerClass)}
                    href={providerHref}>{provider.Value}</a>
                );
            })
        ]
    }
      </div>
    );
}

export class LoginFormEntity {
    Attributes?: any[];
    CssClass?: string;
    Margins?: OffsetStyle;
    PostLoginAction?: PostLoginAction;
    PostLoginRedirectPage?: MixedContentContext;
    RegistrationPage?: MixedContentContext;
    ResetPasswordPage?: MixedContentContext;
    RememberMe?: boolean;
    ExternalProviders?: string[];
    SfViewName?: string;
    MembershipProviderName?: string;
    Header?: string; // 'Login'
    EmailLabel?: string; // 'Email / Username'
    PasswordLabel?: string; // 'Password'
    SubmitButtonLabel?: string; // 'Log in'
    ErrorMessage?: string; // 'Incorrect credentials.'
    RememberMeLabel?: string; // 'Remember me'
    ForgottenPasswordLinkLabel?: string; // 'Forgotten password'
    NotRegisteredLabel?: string; // 'Not registered yet?'
    RegisterLinkText?: string; // 'Register now'
    ExternalProvidersHeader?: string; // 'or use account in...'
    ValidationRequiredMessage?: string; // 'All fields are required.'
    ValidationInvalidEmailMessage?: string; // 'Invalid email format.'
    // private const string SelectPages = "Select pages";
    // private const string LoginWithExternalProviders = "Login with external providers";
}
