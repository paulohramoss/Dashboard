import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(
  ({ className, defaultValue, children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
      <div
        ref={ref}
        data-active-tab={activeTab}
        className={cn("", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type.displayName === "TabsContent") {
              return React.cloneElement(child, { activeTab });
            }
            return React.cloneElement(child, { activeTab, setActiveTab });
          }
          return child;
        })}
      </div>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(
  ({ className, activeTab, setActiveTab, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  )
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(
  ({ className, value, activeTab, setActiveTab, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={activeTab === value}
      data-state={activeTab === value ? "active" : "inactive"}
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(
  ({ className, value, activeTab, children, ...props }, ref) => {
    if (value !== activeTab) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
