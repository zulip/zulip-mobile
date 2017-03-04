//
//  RNGoogleSignIn.swift
//
//  Created by Joon Ho Cho on 1/16/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

@objc(RNGoogleSignIn)
class RNGoogleSignIn: NSObject, GIDSignInUIDelegate {
  
  static let sharedInstance = RNGoogleSignIn()

  weak var events: RNGoogleSignInEvents?

  override init() {
    super.init()
    GIDSignIn.sharedInstance().uiDelegate = self
  }
  
//  @objc func addEvent(_ name: String, location: String, date: NSNumber, callback: @escaping (Array<String>) -> ()) -> Void {
//    NSLog("%@ %@ %@", name, location, date)
//    self.callback = callback
  //  }
  
  @objc func configure(_ config: [String: Any]) {
    if let instance = GIDSignIn.sharedInstance() {
      if let clientID = config["clientID"] as? String {
        instance.clientID = clientID
      }
      if let scopes = config["scopes"] as? [String] {
        instance.scopes = scopes
      }
      if let shouldFetchBasicProfile = config["shouldFetchBasicProfile"] as? Bool {
        instance.shouldFetchBasicProfile = shouldFetchBasicProfile
      }
      if let language = config["language"] as? String {
        instance.language = language
      }
      if let loginHint = config["loginHint"] as? String {
        instance.loginHint = loginHint
      }
      if let serverClientID = config["serverClientID"] as? String {
        instance.serverClientID = serverClientID
      }
      if let openIDRealm = config["openIDRealm"] as? String {
        instance.openIDRealm = openIDRealm
      }
      if let hostedDomain = config["hostedDomain"] as? String {
        instance.hostedDomain = hostedDomain
      }
    }
  }
  
  @objc func signIn() {
    DispatchQueue.main.async {
      GIDSignIn.sharedInstance().signIn()
    }
  }
  
  @objc func signOut() {
    DispatchQueue.main.async {
      GIDSignIn.sharedInstance().signOut()
    }
  }
  
  @objc func signInSilently() {
    DispatchQueue.main.async {
      GIDSignIn.sharedInstance().signInSilently()
    }
  }
  
  @objc func disconnect() {
    DispatchQueue.main.async {
      GIDSignIn.sharedInstance().disconnect()
    }
  }
  
  @objc func currentUser(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(RNGoogleSignInEvents.userToJSON(GIDSignIn.sharedInstance().currentUser))
  }
  
  @objc func hasAuthInKeychain(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(GIDSignIn.sharedInstance().hasAuthInKeychain())
  }
  
  @objc func constantsToExport() -> [String: Any] {
    return [
      "dark": "dark",
      "light": "light",
      "iconOnly": "iconOnly",
      "standard": "standard",
      "wide": "wide",
    ]
  }
  
  
  // START: GIDSignInUIDelegate
  
  func sign(inWillDispatch signIn: GIDSignIn!, error: Error?) {
    events?.dispatch(error: error)
  }
  
  func sign(_ signIn: GIDSignIn!, dismiss viewController: UIViewController!) {
    viewController.dismiss(animated: true, completion: nil)
  }
  
  func sign(_ signIn: GIDSignIn!, present viewController: UIViewController!) {
    UIApplication.shared.keyWindow?.rootViewController?.present(viewController, animated: true, completion: nil)
  }
  
  // END: GIDSignInUIDelegate
}
