# Option A — OTT App: "Watchlist Feature" A logged-in user can add and remove titles to their Watchlist, view their full Watchlist on a dedicated screen, and see a Watchlist indicator icon on content cards that are already saved.

---

## Feature Breakdown - Split the feature into at least 6 discrete AI tasks. Each task should be small enough that a single Composer/Agent prompt could handle it. Order them as you would actually build them.

#### Features BreakDown for Watchlist Feature - 

1. **For logged in user**-  Creation of WatchList page
2. **For logged in user** - Navigation to watchlist page via click on WatchList from menu
3. **For logged in user** - Create CTA (+ WatchList) to Add content in watchlist from content’s PI page
4. **For logged in user** - By clicking on (+ WatchList) to add content in watchlist from content's PI page and change + to ✓. 
5. **For logged in user** - By clicking on (✓ WatchList) to remove content from watchlist from content’s PI page and change ✓ to +.
6. **For logged in user** - SnackBar to show a message to the user if content is added or removed.
7. **For logged in user**- Show Watchlist indicator Icon on content card after content is  added in watchList
8. **For logged in user** - Option to remove watchlisted content from watchList page.
9. **For Guest user** - Navigation of clicking on watchList Page from menu 
10. **For Guest User** - Navigation on clicking CTA (+ WatchList) from content PI Page.

---

## Two Full Prompts (CDIR) -  Write the complete prompt you would use for 2 of those 6 tasks. Be specific. Reference file paths, components, and patterns — even if they are hypothetical. Show your context, decomposition, and instructions.

 **On the basis of above tasks, here are two full prompts for the tasks mentioned as sequential-**

 **AI Task 1** <br> 
In our project, using our existing Navigation pattern mentioned in (@file src/navigation/NavigationStack.tsx), create a WatchList Screen component. It should display a text heading - My WatchList with styling  - textColor : white, textSize : 17, fontWeight: Bold, heading alignment should be on the left side of the screen. On the bottom of the heading with margin : 40, it should display a scrollable gridView of content cards. View should be in safeAreaView and screen margin for left and right should be 20. Use existing Content Card component (@file src/components/ContentCard.tsx). Create a hook for api call (“api_url”), fetch response from it and pass it to gridView of content cards. No new libraries. 


 **AI Task 4** <br>
In our project, using our existing Button pattern as reference mentioned in (@file src/ui/Button.tsx), create a new button using Touchable Opacity. It should display text - + WatchList with the same styling pattern used in the existing Button. On click, it should trigger our existing api mentioned in (@file src/network/watchList). Upon successful response of an api, + sign should be changed into ✓ sign. No new libraries.

---

## Plan Mode Outline - For the most complex task in your breakdown, write what you would expect the Agent to produce in Plan Mode before coding. What questions should it ask? What files should it reference? What steps should the plan contain?

The Agent should follow rules, skills and documentation (if any given). Expectation from an agent is to deliver the most effective method to implement the feature with the knowledge of the existing project.
The Agent should first explore the existing project. It should ask about technology, language, what components it should use or take reference from. What are the specific scenarios for this feature (if any)? 

> #### For any plan, steps are -
>
> 1. Provide context about the feature to the agent.
> 2. Clear the doubts of agents during planning. 
> 3. Ask the agent to decompose this feature into smaller parts so it can be implemented one by one without any mess.
> 4. Review the plan that the agent suggested.

---

## .cursor/rules - Additions List at least 3 rules you would add to your rules file specifically for this feature. Explain the reasoning behind each one.

- **Avoid any new libraries** - 
The reason is to not install any new libraries because this can impact on the package.json file. Any library which is not compatible with existing project libraries can cause failure of working existing ones.

- **Always keep in mind of exception/crash handling** - 
For every feature implementation, it is important to always code keeping in mind exception/crash handling. It is best practice for every scale project.

- **No Duplicate data must be shown** - 
To avoid any data duplicacy on the watchlist page.

---

## AI Failure Anticipation - Identify 2 things you expect AI to get wrong or hallucinate for this feature. How would you catch them in your review? How would you correct it with a better follow-up prompt?

AI may do something wrong in code changes. It may update the library version. Or it may install a new package to achieve the concept of this feature.

**There are few ways to catch hallucination or wrong changes in your review :-** 
1. If AI does changes and installing some new packages which are not assumed to be. 
2. By testing in the local environment on every change AI provides for that specific smaller part of the feature (parallel agents).

I would correct it by giving a better context of the feature to AI and by telling what not to do. If still, it is repeating the same mistakes then start the fresh conversation with the new agent and selectively provide context of the feature by using @Past chat.

---

## One thing you learned One concrete thing from the reading, video, or exercises that surprised you or changed how you think about AI-assisted development.

Main learning / hook about AI-assisted learning i learn during article reading, video is AI can do everything you say but first plan things, make sure about what you are going to do. Break it into small pieces.Then execute things with AI. Review the changes AI is doing and double check if it is not impacting on other features. During this process, AI will make errors in code which will also be shown on rendering therefore always use parallel agents and check with each one on the local environment. And where expectations meet with feature implementation, review and accept those changes.

---