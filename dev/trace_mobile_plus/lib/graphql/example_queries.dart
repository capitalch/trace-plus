/// Example GraphQL queries and mutations for the Trace+ app
///
/// This file demonstrates how to use GraphQL with the configured client.
/// Replace these examples with your actual GraphQL schema operations.

// Example: Query to fetch user profile
const String getUserProfileQuery = r'''
  query GetUserProfile {
    userProfile {
      id
      userName
      userEmail
      mobileNo
      clientName
      isUserActive
    }
  }
''';

// Example: Query to fetch business units
const String getBusinessUnitsQuery = r'''
  query GetBusinessUnits {
    businessUnits {
      buId
      buCode
      buName
    }
  }
''';

// Example: Mutation to update user profile
const String updateUserProfileMutation = r'''
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      success
      message
      user {
        id
        userName
        userEmail
      }
    }
  }
''';

// Example: Query with variables
const String getClientDataQuery = r'''
  query GetClientData($clientId: ID!) {
    client(id: $clientId) {
      id
      clientName
      clientCode
      isActive
    }
  }
''';

/// Example of how to use these queries in a widget:
///
/// ```dart
/// import 'package:flutter/material.dart';
/// import 'package:graphql_flutter/graphql_flutter.dart';
/// import '../graphql/example_queries.dart';
///
/// class UserProfileWidget extends StatelessWidget {
///   @override
///   Widget build(BuildContext context) {
///     return Query(
///       options: QueryOptions(
///         document: gql(getUserProfileQuery),
///       ),
///       builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
///         if (result.hasException) {
///           return Text('Error: ${result.exception.toString()}');
///         }
///
///         if (result.isLoading) {
///           return const CircularProgressIndicator();
///         }
///
///         final userProfile = result.data?['userProfile'];
///
///         return Column(
///           children: [
///             Text('Name: ${userProfile['userName']}'),
///             Text('Email: ${userProfile['userEmail']}'),
///           ],
///         );
///       },
///     );
///   }
/// }
/// ```
///
/// Example of mutation:
///
/// ```dart
/// class UpdateProfileButton extends StatelessWidget {
///   @override
///   Widget build(BuildContext context) {
///     return Mutation(
///       options: MutationOptions(
///         document: gql(updateUserProfileMutation),
///         onCompleted: (dynamic resultData) {
///           print('Profile updated successfully');
///         },
///       ),
///       builder: (RunMutation runMutation, QueryResult? result) {
///         return ElevatedButton(
///           onPressed: () {
///             runMutation({
///               'input': {
///                 'userName': 'New Name',
///                 'userEmail': 'new@email.com',
///               },
///             });
///           },
///           child: const Text('Update Profile'),
///         );
///       },
///     );
///   }
/// }
/// ```
///
/// Example of query with variables:
///
/// ```dart
/// Query(
///   options: QueryOptions(
///     document: gql(getClientDataQuery),
///     variables: {
///       'clientId': '123',
///     },
///   ),
///   builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
///     // Handle result...
///   },
/// )
/// ```
