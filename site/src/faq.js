
export const FAQ = `
# FAQ

#### What is this?

This is a demo for Gamercert. Gamercert is a privacy-preserving online identity service that supports anonymous "ad hoc" age verification.

#### How does it work?

If you are a website operator, you can generate a random "challenge string" for each verification session. If your visitor has a Gamercert account, they can obfuscate that string by hashing it with a blinding factor before sending it to Gamercert. Gamercert will verify the user's age, sign the obfuscated string with a private key and return the signature along with the name of the corresponding public key. You can then retrieve the public key from Gamercert, check the signature and grant your visitor access.

No information that could identify your website or associate it with a user is sent to Gamercert's server and no information that could identity or track a user is given to you.

You can find the sourcode and more detailed instructions here.

#### How does Gamercert verify a user's age?

Gamercert uses a mix of in-house manual review and third-party KYC vendors such as Stripe and Veriff.

#### Will Gamercert solve my age-verification compliance needs?

We don't know. Read the ToS and ask your lawyers.

#### Is Gamercert free for websites?

Yes. If you have a website and need to verify the age of your visitors without compromising their privacy, then Gamercert is free for you to integrate and use.

#### Who pays for Gamercert?

Privacy-minded individuals who don't want their PII all over the internet, don't want to be tracked and want to skip the KYC line.

#### Do I have to go through KYC to create a Gamercert account?

No. You can use an unverified Gamercert account to create "pretend" age claims for testing purposes.

#### Can I use this in production?

Reach out to us first. The KYC is real, but Gamercert is still very much in beta and verified accounts are invite-only.

#### Is there a blockchain?

No.
`.trim ();
