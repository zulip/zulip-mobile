//
//  RNGoogleSignInEvents.swift
//
//  Created by Joon Ho Cho on 1/17/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

@objc(RNGoogleSignInEvents)
class RNGoogleSignInEvents: RCTEventEmitter, GIDSignInDelegate {
  var observing = false
  
  override init() {
    super.init()
    GIDSignIn.sharedInstance().delegate = self
    RNGoogleSignIn.sharedInstance.events = self
  }
  
  override func supportedEvents() -> [String] {
    return ["signIn", "signInError", "disconnect", "disconnectError", "dispatch"]
  }
  
  override func startObserving() {
    observing = true
  }
  
  override func stopObserving() {
    observing = false
  }
  
  static func userToJSON(_ user: GIDGoogleUser?) -> [String: Any]? {
    if let user = user {
      var body: [String: Any] = [:]

      if let userID = user.userID {
        body["userID"] = userID
      }

      if let profile = user.profile {
        if let email = profile.email {
          body["email"] = email
        }
        if let name = profile.name {
          body["name"] = name
        }
        if let givenName = profile.givenName {
          body["givenName"] = givenName
        }
        if let familyName = profile.familyName {
          body["familyName"] = familyName
        }
        if profile.hasImage {
          if let url = profile.imageURL(withDimension: 320)?.absoluteString {
            body["imageURL320"] = url
          }
          if let url = profile.imageURL(withDimension: 640)?.absoluteString {
            body["imageURL640"] = url
          }
          if let url = profile.imageURL(withDimension: 1280)?.absoluteString {
            body["imageURL1280"] = url
          }
        }
      }

      if let authentication = user.authentication {
        if let clientID = authentication.clientID {
          body["clientID"] = clientID
        }
        if let accessToken = authentication.accessToken {
          body["accessToken"] = accessToken
        }
        if let accessTokenExpirationDate = authentication.accessTokenExpirationDate {
          body["accessTokenExpirationDate"] = accessTokenExpirationDate.timeIntervalSince1970
        }
        if let refreshToken = authentication.refreshToken {
          body["refreshToken"] = refreshToken
        }
        if let idToken = authentication.idToken {
          body["idToken"] = idToken
        }
        if let idTokenExpirationDate = authentication.idTokenExpirationDate {
          body["idTokenExpirationDate"] = idTokenExpirationDate.timeIntervalSince1970
        }
      }

      if let accessibleScopes = user.accessibleScopes {
        body["accessibleScopes"] = accessibleScopes
      }

      if let hostedDomain = user.hostedDomain {
        body["hostedDomain"] = hostedDomain
      }

      if let serverAuthCode = user.serverAuthCode {
        body["serverAuthCode"] = serverAuthCode
      }
      
      return body
    } else {
      return nil
    }
  }
  
  func signIn(user: GIDGoogleUser?) {
    if (!observing) { return }
    sendEvent(withName: "signIn", body: RNGoogleSignInEvents.userToJSON(user))
  }
  
  func signInError(error: Error?) {
    if (!observing) { return }
    sendEvent(withName: "signInError", body: [
      "description": error?.localizedDescription ?? "",
      ])
  }
  
  func disconnect(user: GIDGoogleUser?) {
    if (!observing) { return }
    sendEvent(withName: "disconnect", body: RNGoogleSignInEvents.userToJSON(user))
  }
  
  func disconnectError(error: Error?) {
    if (!observing) { return }
    sendEvent(withName: "disconnectError", body: [
      "description": error?.localizedDescription ?? "",
      ])
  }
  
  func dispatch(error: Error?) {
    if (!observing) { return }
    sendEvent(withName: "dispatch", body: [
      "description": error?.localizedDescription ?? "",
      ])
  }
  
  func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
    if (error == nil) {
      self.signIn(user: user)
    } else {
      self.signInError(error: error)
    }
  }
  
  func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
    if (error == nil) {
      self.disconnect(user: user)
    } else {
      self.disconnectError(error: error)
    }
  }
}
