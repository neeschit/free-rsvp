Okay, based on our discussion about the data model and the goal of creating private event invitations, here are the product requirements for the **Create Event Page**:

**1. Core Goal:**

*   Enable a logged-in user (the "Host") to easily create a new, private event invitation page.

**2. User Access:**

*   Only authenticated (logged-in) users can access the "Create Event" form/page. Unauthenticated users attempting to access it should be redirected to a login page or shown an appropriate message.

**3. Input Fields & Functionality:**

*   **Event Name:**
    *   Required field.
    *   Text input.
    *   Purpose: To give the event a clear title (e.g., "Leo's 5th Birthday Party").
*   **Event Date(s) / Time(s):**
    *   Required field.
    *   Mechanism to select one or potentially multiple date/time options for guests to vote on (MVP might just support one date/time initially).
    *   Should support standard date and time formats.
    *   Purpose: To inform guests when the event is planned.
*   **Event Location:**
    *   Optional field.
    *   Text input.
    *   Can default to a placeholder like "TBD" (To Be Determined) if left blank.
    *   Purpose: To inform guests where the event will take place.
*   **Host Information:**
    *   Automatically associate the currently logged-in user as the event's host (`HostId`). This is not an input field for the user but a system requirement.
*   **Create Event Button:**
    *   Triggers the event creation process.
    *   Should be disabled until all required fields are validly filled.

**4. Event Creation Process (Backend Logic):**

*   Upon submission:
    *   Validate all required inputs.
    *   Generate a unique identifier for the event (e.g., `EVENT#leo-s-5th-bday-xyz`).
    *   Save the event details to the database (`Kiddobash` table) as an `EventMetadataItem`.
    *   Crucially, set the event's visibility to private (`isPublic: false`).
    *   Record the `HostId` (the logged-in user's ID, e.g., `USER#user-id-123`).
    *   Record the creation timestamp.
*   On Successful Creation:
    *   Redirect the host to the newly created event's dedicated page (e.g., `/event/EVENT#leo-s-5th-bday-xyz`).
*   On Failure:
    *   Display clear error messages to the user indicating what went wrong (e.g., "Event name is required," "Failed to save event").

**5. Privacy:**

*   All events created through this page must default to `private` (`isPublic: false`). Public event creation is not part of this feature's scope initially. This ensures event details are only shared via the unique event link.

**6. User Experience:**

*   The form should be simple and intuitive.
*   Clear labels for all input fields.
*   Visual indication of required fields.
*   Provide feedback during and after submission (e.g., loading state on the button, success message via redirect, error messages on failure).

**7. Future Considerations (Out of Scope for Initial Version):**

*   Adding event themes or descriptions.
*   Uploading cover images.
*   Setting RSVP deadlines.
*   Directly inviting guests during the creation process.
*   Ability to edit event details after creation.
