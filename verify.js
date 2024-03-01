
const generateDynamicEmail=( link,firstName)=> {
    
  return `


  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8"> <!-- utf-8 works for most cases -->
        <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
        <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
        <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
        <center style="width: 100%; background-color: #f1f1f1;">
        <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="max-width: 600px; margin: 0 auto;">
            <!-- BEGIN BODY -->
          <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto; display: flex; align-items: center; justify-content: center; flex-direction: column;">
              <tr>
              <td valign="top" style="padding: 1em 2.5em 0 2.5em; background-color: #ffffff;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                          <!-- <td style="text-align: center;">
                            <h1 style="margin: 0;"><a href="#" style="color: #30e3ca; font-size: 24px; font-weight: 700; font-family: 'Lato', sans-serif;">THE CURVE COHORT3</a></h1>
                          </td> -->
                      </tr>
                  </table>
              </td>
              </tr><!-- end tr -->
              <tr>
              <td valign="middle" style="padding: 3em 0 2em 0;">
                <img src="https://res.cloudinary.com/dgdsmfgx6/image/upload/v1709299701/tradturqku7nisqf5oiz.png" alt="" style="width: 150px; max-width: 300px; height: auto; margin: auto; display: block;">
              </td>
              </tr><!-- end tr -->
                    <tr>
              <td valign="middle" style="padding: 2em 0 4em 0;">
                <table>
                    <tr>
                        <td>
                            <div style="padding: 0 2.5em; text-align: center; margin-bottom: 0px;">
                                <h2 style="font-family: 'Lato', sans-serif; color: rgba(0,0,0,.3); font-size: 30px; margin-bottom: 0; font-weight: 400;">Please verify your email</h2>
                                <h3 style="font-family: 'Lato', sans-serif; font-size: 22px; font-weight: 300;"> Welcome on Board, ${firstName},<br/>Click the button below to verify your account.</h3>
                                <p><a href=${link} class="btn btn-primary" style="padding: 10px 30px; display: inline-block; border-radius: 3px;  margin-top:20px; background: #00FFEF; color: #ffffff; text-decoration: none;">Verify</a></p>
                                <h6 style="font-family: 'Lato', sans-serif; font-size: 18px; font-weight: 300; margin-bottom: 0px; padding: 0px;">This email expires in 5minutes</h6>
                            </div>
                        </td>
                    </tr>
                </table>
              </td>
              </tr><!-- end tr -->
          <!-- 1 Column Text + Button : END -->
          </table>
          <h3 style="color: #000; font-size: 18px; margin-top: 0; font-weight: 400; margin-bottom: 10px; color: rgba(0,0,0,.5);">Contact Info</h3>
          
          <span style="color: rgba(0,0,0,.5);">52/Salami Road,Olodi Apapa</span><br>
           <span style="color: rgba(0,0,0,.5);">09025222452</span>
           <p style="text-align: center; color: rgba(0,0,0,.5); font-family: 'Lato', sans-serif; font-size: 12px;">
            © Copyright 2024. All rights reserved.<br/>
           </p>
    
        </div>
      </center>
    </body>
    </html>

  `
}

module.exports = 
  generateDynamicEmail